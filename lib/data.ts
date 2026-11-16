import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "./supabase";
import { MEMBER_COOKIE } from "./session";
import type { Dish, Gathering, Headcount, Member, Photo, Recipe, RecipeHistory, RecipeSummary, Rsvp } from "./types";

export const imgUrl = (path: string) => `/img/${path}`;

const UUID = /^[0-9a-f-]{36}$/;

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const getMembers = cache(async (): Promise<Member[]> =>
  check(await db().from("lt_members").select("id,name,emoji").order("name")),
);

export const getMe = cache(async (): Promise<Member | null> => {
  const id = (await cookies()).get(MEMBER_COOKIE)?.value;
  if (!id) return null;
  return (await getMembers()).find((m) => m.id === id) ?? null;
});

const GATHERING_COLS = "id,title,kind,date,time_note,host,place,address,notes,created_at";

export const listGatherings = cache(async (): Promise<Gathering[]> =>
  check(
    await db()
      .from("lt_gatherings")
      .select(GATHERING_COLS)
      .order("date", { ascending: false, nullsFirst: true })
      .order("created_at", { ascending: false }),
  ),
);

export const getGathering = cache(async (id: string): Promise<Gathering | null> => {
  if (!UUID.test(id)) return null;
  return check(await db().from("lt_gatherings").select(GATHERING_COLS).eq("id", id).maybeSingle());
});

/**
 * The gathering the home page shows: the next one coming up (counting the
 * couple of days after, so photos can still be added), else the latest one.
 */
export const getCurrentGathering = cache(async (): Promise<Gathering | null> => {
  const all = await listGatherings();
  if (!all.length) return null;
  const cutoff = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);
  const upcoming = all.filter((g) => g.date && g.date >= cutoff).sort((a, b) => a.date!.localeCompare(b.date!));
  return upcoming[0] ?? all.find((g) => g.date) ?? all[0];
});

export async function getRsvps(gatheringId: string): Promise<Rsvp[]> {
  return check(
    await db()
      .from("lt_rsvps")
      .select("id,gathering_id,party,status,adults,kids,note,member_id,updated_at")
      .eq("gathering_id", gatheringId)
      .order("created_at"),
  );
}

export function headcount(rsvps: Rsvp[]): Headcount {
  const yes = rsvps.filter((r) => r.status === "yes");
  const adults = yes.reduce((n, r) => n + r.adults, 0);
  const kids = yes.reduce((n, r) => n + r.kids, 0);
  const maybe = rsvps.filter((r) => r.status === "maybe").reduce((n, r) => n + r.adults + r.kids, 0);
  return { adults, kids, total: adults + kids, maybe, parties: yes.length };
}

export async function getDishes(gatheringId: string): Promise<Dish[]> {
  return check(
    await db()
      .from("lt_dishes")
      .select("id,gathering_id,course,name,split,bringer,bringer_member_id,buyer,buyer_member_id,note,sort_order,recipe_id")
      .eq("gathering_id", gatheringId)
      .order("sort_order")
      .order("created_at"),
  );
}

type PhotoRow = Omit<Photo, "url" | "thumb">;
const withUrls = (p: PhotoRow): Photo => ({ ...p, url: imgUrl(p.path), thumb: imgUrl(p.thumb_path) });
const PHOTO_COLS = "id,gathering_id,kind,artist,caption,path,thumb_path,member_id,created_at";

export async function getPhotos(opts: { gatheringId?: string; kind?: string; limit?: number } = {}): Promise<Photo[]> {
  let q = db().from("lt_photos").select(PHOTO_COLS);
  if (opts.gatheringId) q = q.eq("gathering_id", opts.gatheringId);
  if (opts.kind === "photo" || opts.kind === "art") q = q.eq("kind", opts.kind);
  const rows = check(await q.order("created_at", { ascending: false }).limit(opts.limit ?? 500)) as PhotoRow[];
  return rows.map(withUrls);
}

/* ---------- Recipe Box ---------- */

type RecipePhotoRow = { id: string; kind: "card" | "dish"; path: string; thumb_path: string; sort_order: number };
const byOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

/** The photo to show on a recipe's card in the list: a dish photo if there is one, else the recipe card. */
const coverOf = (photos: RecipePhotoRow[]) => {
  const sorted = [...photos].sort(byOrder);
  const cover = sorted.find((p) => p.kind === "dish") ?? sorted[0];
  return cover ? imgUrl(cover.thumb_path) : null;
};

export async function listRecipes(): Promise<RecipeSummary[]> {
  type Row = Omit<RecipeSummary, "thumb" | "times_made" | "search"> & {
    ingredients: string | null;
    lt_recipe_photos: RecipePhotoRow[];
    lt_dishes: { count: number }[];
  };
  const rows = check(
    await db()
      .from("lt_recipes")
      .select("id,title,from_whom,course,tags,ingredients,updated_at,lt_recipe_photos(id,kind,path,thumb_path,sort_order),lt_dishes(count)")
      .order("title")
      .limit(2000),
  ) as Row[];
  return rows.map(({ lt_recipe_photos, lt_dishes, ingredients, ...r }) => ({
    ...r,
    thumb: coverOf(lt_recipe_photos),
    times_made: lt_dishes?.[0]?.count ?? 0,
    search: [r.title, r.from_whom, ingredients].filter(Boolean).join(" ").toLowerCase(),
  }));
}

export async function getRecipe(id: string): Promise<{ recipe: Recipe; history: RecipeHistory[] } | null> {
  if (!UUID.test(id)) return null;
  type Row = Omit<Recipe, "photos"> & { lt_recipe_photos: RecipePhotoRow[] };
  const row = check(
    await db()
      .from("lt_recipes")
      .select(
        "id,title,from_whom,course,servings,time_note,story,ingredients,steps,tags,created_by,updated_by,created_at,updated_at,lt_recipe_photos(id,kind,path,thumb_path,sort_order)",
      )
      .eq("id", id)
      .maybeSingle(),
  ) as Row | null;
  if (!row) return null;
  const { lt_recipe_photos, ...rest } = row;
  const recipe: Recipe = {
    ...rest,
    photos: [...lt_recipe_photos]
      .sort(byOrder)
      .map((p) => ({ id: p.id, kind: p.kind, path: p.path, thumb_path: p.thumb_path, url: imgUrl(p.path), thumb: imgUrl(p.thumb_path) })),
  };

  type DishRow = {
    id: string;
    split: boolean;
    bringer: string | null;
    gathering_id: string;
    lt_gatherings: { title: string; date: string | null } | { title: string; date: string | null }[] | null;
  };
  const dishes = check(
    await db().from("lt_dishes").select("id,split,bringer,gathering_id,lt_gatherings(title,date)").eq("recipe_id", id),
  ) as DishRow[];
  const history = dishes
    .map((d) => {
      const g = Array.isArray(d.lt_gatherings) ? d.lt_gatherings[0] : d.lt_gatherings;
      return {
        dish_id: d.id,
        gathering_id: d.gathering_id,
        gathering_title: g?.title ?? "A gathering",
        date: g?.date ?? null,
        made_by: d.bringer,
      };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return { recipe, history };
}

/** Just enough to pick a recipe to link a dish to. */
export async function listRecipeTitles(): Promise<{ id: string; title: string; from_whom: string | null }[]> {
  return check(await db().from("lt_recipes").select("id,title,from_whom").order("title").limit(2000));
}

export async function getDish(id: string): Promise<(Dish & { gathering_title: string }) | null> {
  if (!UUID.test(id)) return null;
  const row = check(
    await db()
      .from("lt_dishes")
      .select("id,gathering_id,course,name,split,bringer,bringer_member_id,buyer,buyer_member_id,note,sort_order,recipe_id,lt_gatherings(title)")
      .eq("id", id)
      .maybeSingle(),
  ) as (Dish & { lt_gatherings: { title: string } | { title: string }[] | null }) | null;
  if (!row) return null;
  const { lt_gatherings, ...dish } = row;
  const g = Array.isArray(lt_gatherings) ? lt_gatherings[0] : lt_gatherings;
  return { ...dish, gathering_title: g?.title ?? "" };
}
