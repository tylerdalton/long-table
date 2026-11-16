"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db, PHOTO_BUCKET } from "@/lib/supabase";
import { AUTH_COOKIE, AUTH_MAX_AGE, MEMBER_COOKIE, createAuthToken, verifyAuthToken } from "@/lib/session";
import { CLASSIC_THANKSGIVING, COURSES, KINDS, RECIPE_TAGS, type DishRole } from "@/lib/types";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: AUTH_MAX_AGE,
};

// Server actions can be POSTed to any route, so each one checks the cookie itself.
async function requireAuth(): Promise<string | null> {
  const jar = await cookies();
  if (!(await verifyAuthToken(jar.get(AUTH_COOKIE)?.value))) redirect("/login");
  const me = jar.get(MEMBER_COOKIE)?.value ?? null;
  return me && UUID.test(me) ? me : null;
}

async function myName(me: string | null): Promise<string | null> {
  if (!me) return null;
  const { data } = await db().from("lt_members").select("name").eq("id", me).maybeSingle();
  return data?.name ?? null;
}

const UUID = /^[0-9a-f-]{36}$/;
const str = (v: FormDataEntryValue | null | undefined, max = 2000) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return s || null;
};
const uuidOrNull = (v: unknown) => (typeof v === "string" && UUID.test(v) ? v : null);
const int = (v: FormDataEntryValue | null, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const dateOrNull = (v: FormDataEntryValue | null) => {
  const s = str(v, 10);
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ---------- Getting in ---------- */

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const given = (form.get("passcode") as string | null)?.trim().toLowerCase() ?? "";
  const expected = (process.env.FAMILY_PASSCODE ?? "").trim().toLowerCase();
  if (!expected) return "The app's passcode hasn't been set up yet.";
  if (given !== expected) {
    await new Promise((r) => setTimeout(r, 700));
    return "Hmm, that's not it. Ask Melanie!";
  }
  (await cookies()).set(AUTH_COOKIE, await createAuthToken(), cookieOpts);
  redirect("/who");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  jar.delete(MEMBER_COOKIE);
  redirect("/login");
}

export async function switchPerson() {
  (await cookies()).delete(MEMBER_COOKIE);
  redirect("/who");
}

export async function chooseMember(id: string) {
  await requireAuth();
  if (!UUID.test(id)) return;
  (await cookies()).set(MEMBER_COOKIE, id, cookieOpts);
  redirect("/");
}

export async function createMember(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAuth();
  const name = str(form.get("name"), 40);
  const emoji = str(form.get("emoji"), 8) ?? "🦃";
  if (!name) return "What should we call you?";
  const { data, error } = await db().from("lt_members").insert({ name, emoji }).select("id").single();
  if (error?.code === "23505") return `Someone named ${name} is already here. Tap your name above!`;
  fail(error);
  (await cookies()).set(MEMBER_COOKIE, data!.id, cookieOpts);
  redirect("/");
}

/* ---------- Gatherings ---------- */

export async function saveGathering(_prev: string | null, form: FormData): Promise<string | null> {
  const me = await requireAuth();
  const id = uuidOrNull(form.get("id"));
  const title = str(form.get("title"), 80);
  if (!title) return "Give this gathering a name, like “Thanksgiving 2026”.";
  const kind = String(form.get("kind"));
  const fields = {
    title,
    kind: KINDS.some((k) => k.id === kind) ? kind : "other",
    date: dateOrNull(form.get("date")),
    time_note: str(form.get("time_note"), 120),
    host: str(form.get("host"), 120),
    place: str(form.get("place"), 120),
    address: str(form.get("address"), 240),
    notes: str(form.get("notes")),
  };

  if (id) {
    fail((await db().from("lt_gatherings").update(fields).eq("id", id)).error);
    redirect(`/g/${id}`);
  }

  const { data, error } = await db()
    .from("lt_gatherings")
    .insert({ ...fields, created_by: me })
    .select("id")
    .single();
  fail(error);
  const newId = data!.id as string;
  if (form.get("classic_menu") === "on") {
    fail(
      (
        await db()
          .from("lt_dishes")
          .insert(CLASSIC_THANKSGIVING.map((d, i) => ({ ...d, gathering_id: newId, sort_order: i, created_by: me })))
      ).error,
    );
  }
  redirect(`/g/${newId}`);
}

export async function deleteGathering(id: string) {
  await requireAuth();
  if (!UUID.test(id)) return;
  const photos = await db().from("lt_photos").select("path,thumb_path").eq("gathering_id", id);
  fail((await db().from("lt_gatherings").delete().eq("id", id)).error);
  if (photos.data?.length) {
    await db().storage.from(PHOTO_BUCKET).remove(photos.data.flatMap((p) => [p.path, p.thumb_path]));
  }
  redirect("/tables");
}

/* ---------- RSVPs ---------- */

export async function saveRsvp(_prev: string | null, form: FormData): Promise<string | null> {
  const me = await requireAuth();
  const id = uuidOrNull(form.get("id"));
  const gatheringId = uuidOrNull(form.get("gathering_id"));
  const party = str(form.get("party"), 80);
  if (!gatheringId) return "Something went wrong. Try reloading.";
  if (!party) return "Who's coming? Add a name, like “The Daltons”.";
  const status = String(form.get("status"));
  const fields = {
    party,
    status: status === "maybe" || status === "no" ? status : "yes",
    adults: int(form.get("adults"), 0, 50, 1),
    kids: int(form.get("kids"), 0, 50, 0),
    note: str(form.get("note"), 500),
    updated_by: me,
  };
  if (fields.status !== "no" && fields.adults + fields.kids === 0) return "Add at least one person.";

  const res = id
    ? await db().from("lt_rsvps").update(fields).eq("id", id)
    : await db()
        .from("lt_rsvps")
        .insert({ ...fields, gathering_id: gatheringId, member_id: form.get("mine") === "on" ? me : null });
  if (res.error?.code === "23505") return `${party} already has an RSVP. Tap Edit on it below.`;
  fail(res.error);
  refresh();
  return null;
}

export async function deleteRsvp(id: string) {
  await requireAuth();
  if (!UUID.test(id)) return;
  fail((await db().from("lt_rsvps").delete().eq("id", id)).error);
  refresh();
}

/* ---------- Dishes ---------- */

export async function addDish(_prev: string | null, form: FormData): Promise<string | null> {
  const me = await requireAuth();
  const gatheringId = uuidOrNull(form.get("gathering_id"));
  const name = str(form.get("name"), 120);
  if (!gatheringId) return "Something went wrong. Try reloading.";
  if (!name) return "What's the dish?";
  const courseIn = String(form.get("course"));
  const course = COURSES.some((c) => c.id === courseIn) ? courseIn : "Other";
  const mine = form.get("mine") === "on";
  const { count } = await db()
    .from("lt_dishes")
    .select("id", { count: "exact", head: true })
    .eq("gathering_id", gatheringId);
  fail(
    (
      await db()
        .from("lt_dishes")
        .insert({
          gathering_id: gatheringId,
          course,
          name,
          note: str(form.get("note"), 300),
          bringer: mine ? await myName(me) : null,
          bringer_member_id: mine ? me : null,
          sort_order: (count ?? 0) + 1,
          created_by: me,
        })
    ).error,
  );
  refresh();
  return null;
}

// Bringing the whole dish and cooking a split dish share the bringer columns;
// buying a split dish has its own.
const roleFields = (role: DishRole, name: string | null, memberId: string | null) =>
  role === "buy" ? { buyer: name, buyer_member_id: memberId } : { bringer: name, bringer_member_id: memberId };

const isRole = (r: unknown): r is DishRole => r === "bring" || r === "cook" || r === "buy";

/** Claim a job on a dish for me, or let it go (claim = false) so it's open again. */
export async function claimDish(id: string, role: DishRole, claim: boolean) {
  const me = await requireAuth();
  if (!UUID.test(id) || !isRole(role)) return;
  const fields = claim ? roleFields(role, await myName(me), me) : roleFields(role, null, null);
  fail((await db().from("lt_dishes").update(fields).eq("id", id)).error);
  refresh();
}

/** Sign someone else up for a job on a dish (e.g. Grandma, who isn't on the app). */
export async function assignDish(id: string, role: DishRole, name: string) {
  await requireAuth();
  if (!UUID.test(id) || !isRole(role)) return;
  fail((await db().from("lt_dishes").update(roleFields(role, str(name, 80), null)).eq("id", id)).error);
  refresh();
}

/**
 * Split a dish into buying and cooking, or put it back to one job. Whoever was
 * bringing it becomes the cook; when un-splitting, a lone buyer takes the
 * whole dish rather than being dropped.
 */
export async function setDishSplit(id: string, split: boolean) {
  await requireAuth();
  if (!UUID.test(id)) return;
  if (split) {
    fail((await db().from("lt_dishes").update({ split: true }).eq("id", id)).error);
  } else {
    const { data, error } = await db()
      .from("lt_dishes")
      .select("bringer,bringer_member_id,buyer,buyer_member_id")
      .eq("id", id)
      .single();
    fail(error);
    const promoteBuyer = !data!.bringer && data!.buyer;
    fail(
      (
        await db()
          .from("lt_dishes")
          .update({
            split: false,
            buyer: null,
            buyer_member_id: null,
            ...(promoteBuyer ? { bringer: data!.buyer, bringer_member_id: data!.buyer_member_id } : {}),
          })
          .eq("id", id)
      ).error,
    );
  }
  refresh();
}

export async function deleteDish(id: string) {
  await requireAuth();
  if (!UUID.test(id)) return;
  fail((await db().from("lt_dishes").delete().eq("id", id)).error);
  refresh();
}

/* ---------- Photos & art ---------- */

export async function uploadPhoto(form: FormData): Promise<{ path: string; thumb_path: string }> {
  await requireAuth();
  const full = form.get("full");
  const thumb = form.get("thumb");
  if (!(full instanceof Blob) || !(thumb instanceof Blob)) throw new Error("Missing photo");
  if (full.size > 4_000_000 || thumb.size > 1_000_000) throw new Error("Photo too large");
  const allowed = ["image/jpeg", "image/webp"];
  if (!allowed.includes(full.type) || !allowed.includes(thumb.type)) throw new Error("Unsupported photo type");

  const id = crypto.randomUUID();
  const path = `full/${id}.${full.type === "image/webp" ? "webp" : "jpg"}`;
  const thumb_path = `thumb/${id}.${thumb.type === "image/webp" ? "webp" : "jpg"}`;
  const bucket = db().storage.from(PHOTO_BUCKET);
  const [a, b] = await Promise.all([
    bucket.upload(path, full, { contentType: full.type, cacheControl: "31536000" }),
    bucket.upload(thumb_path, thumb, { contentType: thumb.type, cacheControl: "31536000" }),
  ]);
  fail(a.error);
  fail(b.error);
  return { path, thumb_path };
}

const PHOTO_PATH = /^(full|thumb)\/[0-9a-f-]{36}\.(jpg|webp)$/;

export type SavePhotosInput = {
  gathering_id: string;
  kind: "photo" | "art";
  artist?: string | null;
  caption?: string | null;
  photos: { path: string; thumb_path: string }[];
};

export async function savePhotos(input: SavePhotosInput): Promise<void> {
  const me = await requireAuth();
  const gatheringId = uuidOrNull(input.gathering_id);
  if (!gatheringId) throw new Error("Pick which gathering these are from");
  const kind = input.kind === "art" ? "art" : "photo";
  const photos = (input.photos ?? []).filter((p) => PHOTO_PATH.test(p.path) && PHOTO_PATH.test(p.thumb_path)).slice(0, 60);
  if (!photos.length) return;
  fail(
    (
      await db()
        .from("lt_photos")
        .insert(
          photos.map((p) => ({
            gathering_id: gatheringId,
            kind,
            artist: kind === "art" ? str(input.artist, 80) : null,
            caption: str(input.caption, 500),
            path: p.path,
            thumb_path: p.thumb_path,
            member_id: me,
          })),
        )
    ).error,
  );
  refresh();
}

export async function deletePhoto(id: string) {
  await requireAuth();
  if (!UUID.test(id)) return;
  const { data } = await db().from("lt_photos").select("path,thumb_path").eq("id", id).maybeSingle();
  fail((await db().from("lt_photos").delete().eq("id", id)).error);
  if (data) await db().storage.from(PHOTO_BUCKET).remove([data.path, data.thumb_path]);
  refresh();
}

/* ---------- People ---------- */

export async function deleteMember(id: string) {
  const me = await requireAuth();
  if (!UUID.test(id)) return;
  fail((await db().from("lt_members").delete().eq("id", id)).error);
  if (me === id) (await cookies()).delete(MEMBER_COOKIE);
  refresh();
}

/* ---------- Recipe Box ---------- */

export type RecipeInput = {
  id?: string;
  title: string;
  from_whom?: string | null;
  course?: string | null;
  servings?: string | null;
  time_note?: string | null;
  story?: string | null;
  ingredients?: string | null;
  steps?: string | null;
  tags: string[];
  photos: { kind: "card" | "dish"; path: string; thumb_path: string }[];
  /** When the recipe is started from a dish on the menu, link that dish to it. */
  dish_id?: string | null;
};

export async function saveRecipe(input: RecipeInput): Promise<{ id: string }> {
  const me = await requireAuth();
  const title = str(input.title, 120);
  if (!title) throw new Error("Give the recipe a name");
  const course = str(input.course, 40);
  const fields = {
    title,
    from_whom: str(input.from_whom, 120),
    course: course && COURSES.some((c) => c.id === course) ? course : null,
    servings: str(input.servings, 80),
    time_note: str(input.time_note, 120),
    story: str(input.story, 5000),
    ingredients: str(input.ingredients, 10000),
    steps: str(input.steps, 20000),
    tags: (input.tags ?? []).filter((t) => RECIPE_TAGS.some((x) => x.id === t)),
    updated_by: me,
  };
  const photos = (input.photos ?? [])
    .filter((p) => PHOTO_PATH.test(p.path) && PHOTO_PATH.test(p.thumb_path))
    .map((p) => ({ ...p, kind: p.kind === "card" ? ("card" as const) : ("dish" as const) }))
    .slice(0, 24);

  let id: string;
  if (input.id) {
    if (!UUID.test(input.id)) throw new Error("Bad recipe");
    id = input.id;
    fail((await db().from("lt_recipes").update(fields).eq("id", id)).error);

    const existing = await db().from("lt_recipe_photos").select("id,path,thumb_path").eq("recipe_id", id);
    fail(existing.error);
    const keep = new Set(photos.map((p) => p.path));
    const removed = existing.data!.filter((p) => !keep.has(p.path));
    if (removed.length) {
      await db().from("lt_recipe_photos").delete().in("id", removed.map((p) => p.id));
      await db().storage.from(PHOTO_BUCKET).remove(removed.flatMap((p) => [p.path, p.thumb_path]));
    }
    const byPath = new Map(existing.data!.map((p) => [p.path, p.id]));
    await Promise.all(
      photos.map((p, i) =>
        byPath.has(p.path)
          ? db().from("lt_recipe_photos").update({ sort_order: i, kind: p.kind }).eq("id", byPath.get(p.path)!)
          : db()
              .from("lt_recipe_photos")
              .insert({ recipe_id: id, kind: p.kind, path: p.path, thumb_path: p.thumb_path, sort_order: i, member_id: me }),
      ),
    );
  } else {
    const { data, error } = await db()
      .from("lt_recipes")
      .insert({ ...fields, created_by: me })
      .select("id")
      .single();
    fail(error);
    id = data!.id;
    if (photos.length) {
      fail(
        (
          await db()
            .from("lt_recipe_photos")
            .insert(photos.map((p, i) => ({ recipe_id: id, kind: p.kind, path: p.path, thumb_path: p.thumb_path, sort_order: i, member_id: me })))
        ).error,
      );
    }
  }

  const dishId = uuidOrNull(input.dish_id);
  if (dishId) fail((await db().from("lt_dishes").update({ recipe_id: id }).eq("id", dishId)).error);
  refresh();
  return { id };
}

export async function deleteRecipe(id: string) {
  await requireAuth();
  if (!UUID.test(id)) return;
  const photos = await db().from("lt_recipe_photos").select("path,thumb_path").eq("recipe_id", id);
  fail((await db().from("lt_recipes").delete().eq("id", id)).error);
  if (photos.data?.length) {
    await db().storage.from(PHOTO_BUCKET).remove(photos.data.flatMap((p) => [p.path, p.thumb_path]));
  }
  redirect("/recipes");
}

/** Point a dish on the menu at a recipe already in the box (or unlink with null). */
export async function linkDishRecipe(dishId: string, recipeId: string | null) {
  await requireAuth();
  if (!UUID.test(dishId)) return;
  fail((await db().from("lt_dishes").update({ recipe_id: uuidOrNull(recipeId) }).eq("id", dishId)).error);
  refresh();
}
