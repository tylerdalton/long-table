"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { deletePhoto } from "@/app/actions";
import { timeAgo } from "@/lib/format";
import type { Photo } from "@/lib/types";

export function PhotoGrid({
  photos,
  gatheringTitles,
  memberNames,
}: {
  photos: Photo[];
  gatheringTitles: Record<string, string>;
  memberNames: Record<string, string>;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [pending, start] = useTransition();

  // Open the photo named in the URL hash (links from the gathering page).
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const i = photos.findIndex((p) => p.id === id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the hash only works after mount
    if (i >= 0) setOpen(i);
  }, [photos]);

  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  const current = open !== null ? photos[open] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              onClick={() => setOpen(i)}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-line bg-butter"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumb}
                alt={p.caption ?? (p.kind === "art" ? "Art" : "Photo")}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.03]"
              />
              {p.kind === "art" && (
                <span className="absolute top-2 left-2 rounded-full bg-paper/90 px-2 py-0.5 text-xs font-extrabold">
                  🎨 {p.artist ?? "Art"}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          className="fixed inset-0 z-[70] flex flex-col bg-[#1f160f]/95 text-[#f8f1e5]"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-bold opacity-80">
              {open! + 1} of {photos.length}
            </span>
            <div className="flex gap-2">
              <a href={current.url} download className="btn btn-sm border border-white/20 text-[#f8f1e5]">
                Save
              </a>
              <button
                className="btn btn-sm border border-white/20 text-[#f8f1e5]"
                disabled={pending}
                onClick={() => {
                  if (!confirm("Delete this photo for everyone?")) return;
                  const id = current.id;
                  start(async () => {
                    await deletePhoto(id);
                    close();
                  });
                }}
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
              <button className="btn btn-sm bg-[#f8f1e5] text-ink" onClick={close}>
                Close
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.caption ?? ""}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {photos.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  className="absolute left-2 grid h-12 w-12 place-items-center rounded-full bg-black/40 text-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                >
                  ‹
                </button>
                <button
                  aria-label="Next"
                  className="absolute right-2 grid h-12 w-12 place-items-center rounded-full bg-black/40 text-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
          <div className="pb-safe px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
            {current.caption && <p className="font-display text-xl">{current.caption}</p>}
            <p className="mt-1 text-sm opacity-75">
              {current.kind === "art" && <>🎨 by {current.artist ?? "the family artist"} · </>}
              {gatheringTitles[current.gathering_id]}
              {current.member_id && memberNames[current.member_id] && <> · added by {memberNames[current.member_id]}</>}
              {" · "}
              {timeAgo(current.created_at)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
