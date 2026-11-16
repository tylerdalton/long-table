"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { saveRecipe, uploadPhoto } from "@/app/actions";
import { compressPhoto } from "@/lib/image";
import { COURSES, RECIPE_TAGS, type Recipe } from "@/lib/types";

type Kind = "card" | "dish";
type PhotoItem = {
  key: string;
  kind: Kind;
  preview: string;
  status: "working" | "done" | "error";
  path?: string;
  thumb_path?: string;
};

/** One photo picker (recipe card, or the finished dish) with its thumbnails. */
function PhotoPicker({
  kind,
  title,
  hint,
  emoji,
  items,
  onAdd,
  onRemove,
}: {
  kind: Kind;
  title: string;
  hint: string;
  emoji: string;
  items: PhotoItem[];
  onAdd: (files: FileList | null, kind: Kind) => void;
  onRemove: (key: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const mine = items.filter((p) => p.kind === kind);
  return (
    <div>
      <span className="label">{title}</span>
      <div className="flex flex-wrap gap-2">
        {mine.map((p) => (
          <div key={p.key} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-line bg-butter">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="" className="h-full w-full object-cover" />
            {p.status !== "done" && (
              <span className="absolute inset-0 grid place-items-center bg-black/35 text-xs font-bold text-white">
                {p.status === "working" ? "Uploading…" : "⚠️ Failed"}
              </span>
            )}
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => onRemove(p.key)}
              className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-sm text-white"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e2c9a8] bg-[#fffaf2] text-center text-xs font-bold text-ink-soft transition hover:border-pumpkin"
        >
          <span className="text-2xl">{emoji}</span>
          Add photo
        </button>
      </div>
      <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label={title}
        onChange={(e) => {
          onAdd(e.target.files, kind);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function RecipeForm({
  recipe,
  defaults,
  dishId,
  cancelHref,
}: {
  recipe?: Recipe;
  defaults?: { title?: string; from_whom?: string | null; course?: string | null };
  dishId?: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? []);
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (recipe?.photos ?? []).map((p) => ({
      key: p.id,
      kind: p.kind,
      preview: p.thumb,
      status: "done",
      path: p.path,
      thumb_path: p.thumb_path,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string, patch: Partial<PhotoItem>) =>
    setPhotos((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  async function addPhotos(files: FileList | null, kind: Kind) {
    for (const file of Array.from(files ?? [])) {
      const key = crypto.randomUUID();
      try {
        const { full, thumb, preview } = await compressPhoto(file);
        setPhotos((list) => [...list, { key, kind, preview, status: "working" }]);
        const form = new FormData();
        form.append("full", full);
        form.append("thumb", thumb);
        update(key, { status: "done", ...(await uploadPhoto(form)) });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't add that photo");
        update(key, { status: "error" });
      }
    }
  }

  const uploading = photos.some((p) => p.status === "working");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => (f.get(k) as string | null) ?? "";
    setSaving(true);
    setError(null);
    try {
      const { id } = await saveRecipe({
        id: recipe?.id,
        title: get("title"),
        from_whom: get("from_whom"),
        course: get("course"),
        servings: get("servings"),
        time_note: get("time_note"),
        story: get("story"),
        ingredients: get("ingredients"),
        steps: get("steps"),
        tags,
        photos: photos
          .filter((p) => p.status === "done" && p.path && p.thumb_path)
          .map((p) => ({ kind: p.kind, path: p.path!, thumb_path: p.thumb_path! })),
        dish_id: dishId,
      });
      router.push(`/recipes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28 md:pb-0">
      <div className="card space-y-6 p-5 sm:p-8">
        <PhotoPicker
          kind="card"
          title="The recipe card"
          emoji="📇"
          hint="Snap the handwritten card or cookbook page. That alone saves the recipe, and you can type it out later."
          items={photos}
          onAdd={addPhotos}
          onRemove={(k) => setPhotos((l) => l.filter((p) => p.key !== k))}
        />
        <PhotoPicker
          kind="dish"
          title="The finished dish"
          emoji="🍽️"
          hint="Optional, but it makes the Recipe Box look delicious."
          items={photos}
          onAdd={addPhotos}
          onRemove={(k) => setPhotos((l) => l.filter((p) => p.key !== k))}
        />
      </div>

      <div className="card space-y-6 p-5 sm:p-8">
        <div>
          <label className="label" htmlFor="title">
            Recipe name
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={120}
            defaultValue={recipe?.title ?? defaults?.title}
            className="field text-lg font-semibold"
            placeholder="Grandma's sweet potato casserole"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="from_whom">
              Whose recipe is it?
            </label>
            <input
              id="from_whom"
              name="from_whom"
              maxLength={120}
              defaultValue={recipe?.from_whom ?? defaults?.from_whom ?? ""}
              className="field"
              placeholder="Grandma Jean"
            />
          </div>
          <div>
            <label className="label" htmlFor="course">
              Course
            </label>
            <select id="course" name="course" className="field" defaultValue={recipe?.course ?? defaults?.course ?? ""}>
              <option value="">Pick one…</option>
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="servings">
              Makes
            </label>
            <input
              id="servings"
              name="servings"
              maxLength={80}
              defaultValue={recipe?.servings ?? ""}
              className="field"
              placeholder="Feeds 12"
            />
          </div>
          <div>
            <label className="label" htmlFor="time_note">
              Time
            </label>
            <input
              id="time_note"
              name="time_note"
              maxLength={120}
              defaultValue={recipe?.time_note ?? ""}
              className="field"
              placeholder="4 hours, plus an overnight brine"
            />
          </div>
        </div>

        <div>
          <span className="label">Tags</span>
          <div className="flex flex-wrap gap-2">
            {RECIPE_TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="chip"
                aria-pressed={tags.includes(t.id)}
                onClick={() => setTags((x) => (x.includes(t.id) ? x.filter((y) => y !== t.id) : [...x, t.id]))}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="story">
            The story <span className="font-semibold normal-case">(optional)</span>
          </label>
          <textarea
            id="story"
            name="story"
            rows={3}
            defaultValue={recipe?.story ?? ""}
            className="field"
            placeholder="Grandma made this every year since 1974. The secret is the extra nutmeg."
          />
        </div>

        <div>
          <label className="label" htmlFor="ingredients">
            Ingredients <span className="font-semibold normal-case">(one per line)</span>
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={8}
            defaultValue={recipe?.ingredients ?? ""}
            className="field font-mono text-[15px]"
            placeholder={"3 lbs sweet potatoes\n1 cup brown sugar\n1/2 cup butter\nMini marshmallows"}
          />
        </div>

        <div>
          <label className="label" htmlFor="steps">
            Steps <span className="font-semibold normal-case">(one per line)</span>
          </label>
          <textarea
            id="steps"
            name="steps"
            rows={8}
            defaultValue={recipe?.steps ?? ""}
            className="field"
            placeholder={"Boil the sweet potatoes until soft.\nMash with butter and brown sugar.\nTop with marshmallows and bake at 350° for 25 minutes."}
          />
        </div>
      </div>

      {error && <p className="text-center font-semibold text-berry-deep">{error}</p>}

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-2xl gap-2 md:max-w-none">
          <Link href={cancelHref} className="btn btn-ghost">
            Cancel
          </Link>
          <button className="btn btn-primary flex-1 md:flex-none" disabled={saving || uploading}>
            {saving ? "Saving…" : uploading ? "Uploading photos…" : recipe ? "Save changes" : "Add to the Recipe Box 📖"}
          </button>
        </div>
      </div>
    </form>
  );
}
