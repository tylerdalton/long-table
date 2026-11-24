"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { savePhotos, uploadPhoto } from "@/app/actions";
import { compressPhoto } from "@/lib/image";
import type { PhotoKind } from "@/lib/types";

type Pending = {
  key: string;
  preview: string | null;
  status: "working" | "done" | "error";
  error?: string;
  paths?: { path: string; thumb_path: string };
};

export function PhotoUploader({
  gatherings,
  defaultGatheringId,
  defaultKind,
}: {
  gatherings: { id: string; title: string }[];
  defaultGatheringId: string;
  defaultKind: PhotoKind;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<PhotoKind>(defaultKind);
  const [artist, setArtist] = useState("Rope");
  const [gatheringId, setGatheringId] = useState(defaultGatheringId);
  const [caption, setCaption] = useState("");
  const [items, setItems] = useState<Pending[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: string, patch: Partial<Pending>) =>
    setItems((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const batch = Array.from(files).map((file) => ({ file, key: crypto.randomUUID() }));
    setItems((list) => [...list, ...batch.map(({ key }) => ({ key, preview: null, status: "working" as const }))]);
    // A few at a time keeps phones responsive on cell data.
    const queue = [...batch];
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const { file, key } = next;
        try {
          const { full, thumb, preview } = await compressPhoto(file);
          update(key, { preview });
          const form = new FormData();
          form.append("full", full);
          form.append("thumb", thumb);
          update(key, { status: "done", paths: await uploadPhoto(form) });
        } catch (e) {
          update(key, { status: "error", error: e instanceof Error ? e.message : "Upload failed" });
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (input.current) input.current.value = "";
  }

  const done = items.filter((p) => p.status === "done" && p.paths);
  const working = items.some((p) => p.status === "working");

  async function save() {
    if (!done.length) return;
    setSaving(true);
    setError(null);
    try {
      await savePhotos({
        gathering_id: gatheringId,
        kind,
        artist: kind === "art" ? artist : null,
        caption,
        photos: done.map((p) => p.paths!),
      });
      router.push(`/g/${gatheringId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-28 md:pb-0">
      <div className="card space-y-6 p-5 sm:p-8">
        <div>
          <span className="label">What are you adding?</span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: "photo", emoji: "📸", label: "Photos from the day" },
                { id: "art", emoji: "🎨", label: "Art" },
              ] as const
            ).map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={kind === k.id}
                onClick={() => setKind(k.id)}
                className="rounded-2xl border-2 border-line bg-paper px-4 py-4 text-left font-bold transition aria-pressed:border-plum aria-pressed:bg-marigold-soft/60"
              >
                <span className="block text-3xl">{k.emoji}</span>
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {kind === "art" && (
          <div>
            <label className="label" htmlFor="artist">
              Artist
            </label>
            <input id="artist" className="field" maxLength={80} value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="gathering">
              From
            </label>
            <select id="gathering" className="field" value={gatheringId} onChange={(e) => setGatheringId(e.target.value)}>
              {gatherings.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="caption">
              Caption <span className="font-semibold normal-case">(optional)</span>
            </label>
            <input
              id="caption"
              className="field"
              maxLength={500}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={kind === "art" ? "This year's turkey masterpiece" : "The whole crew before dinner"}
            />
          </div>
        </div>

        <div>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            id="files"
            onChange={(e) => addFiles(e.target.files)}
          />
          <label
            htmlFor="files"
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#e2c9a8] bg-[#fffaf2] px-6 py-10 text-center transition hover:border-marigold"
          >
            <span className="text-5xl">{kind === "art" ? "🎨" : "📸"}</span>
            <span className="mt-2 text-lg font-bold">{items.length ? "Add more" : "Choose photos"}</span>
            <span className="text-sm text-ink-soft">Take a picture or pick from your phone. Add as many as you like.</span>
          </label>
        </div>

        {items.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {items.map((p) => (
              <li key={p.key} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-pod">
                {p.preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.preview} alt="" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/50 to-transparent px-2 pt-6 pb-1.5 text-xs font-bold text-white">
                  <span>{p.status === "working" ? "Uploading…" : p.status === "done" ? "✓ Ready" : "⚠️ Failed"}</span>
                  <button
                    type="button"
                    aria-label="Remove"
                    className="grid h-6 w-6 place-items-center rounded-full bg-black/40"
                    onClick={() => setItems((list) => list.filter((x) => x.key !== p.key))}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {items.some((p) => p.status === "error") && (
          <p className="text-sm font-semibold text-plum">
            {items.find((p) => p.status === "error")?.error}. Remove it and try again.
          </p>
        )}
      </div>

      {error && <p className="text-center font-semibold text-plum">{error}</p>}

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-2xl gap-2 md:max-w-none">
          <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
            Cancel
          </button>
          <button className="btn btn-primary flex-1 md:flex-none" disabled={!done.length || working || saving} onClick={save}>
            {saving
              ? "Saving…"
              : working
                ? "Uploading…"
                : done.length
                  ? `Save ${done.length} ${kind === "art" ? (done.length === 1 ? "piece" : "pieces") : done.length === 1 ? "photo" : "photos"}`
                  : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
