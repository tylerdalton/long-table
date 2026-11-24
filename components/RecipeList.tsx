"use client";

import Link from "next/link";
import { useState } from "react";
import { COURSES, courseEmoji, RECIPE_TAGS, type RecipeSummary } from "@/lib/types";

export function RecipeList({ recipes }: { recipes: RecipeSummary[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const courses = COURSES.filter((c) => recipes.some((r) => r.course === c.id));
  const query = q.trim().toLowerCase();
  const shown = recipes.filter(
    (r) =>
      (!query || r.search.includes(query)) &&
      (!filter || (filter === "favorite" ? r.tags.includes("favorite") : r.course === filter)),
  );

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="field"
        placeholder="Search by name, who it's from, or an ingredient…"
        aria-label="Search recipes"
      />
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button className="chip" aria-pressed={!filter} onClick={() => setFilter(null)}>
          All
        </button>
        <button className="chip" aria-pressed={filter === "favorite"} onClick={() => setFilter("favorite")}>
          ⭐ Favorites
        </button>
        {courses.map((c) => (
          <button key={c.id} className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.emoji} {c.id}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center font-semibold text-ink-soft">No recipes match that.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <li key={r.id}>
              <Link href={`/recipes/${r.id}`} className="card flex h-full gap-4 p-3 transition hover:border-marigold">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-pod text-4xl">
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    courseEmoji(r.course ?? "")
                  )}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <div className="font-display text-xl leading-tight">{r.title}</div>
                  {r.from_whom && <div className="text-sm text-ink-soft">from {r.from_whom}</div>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {RECIPE_TAGS.filter((t) => r.tags.includes(t.id)).map((t) => (
                      <span key={t.id} className="rounded-full bg-pod px-2 py-0.5 text-xs font-bold text-pod-ink">
                        {t.emoji} {t.label}
                      </span>
                    ))}
                    {r.times_made > 0 && (
                      <span className="rounded-full bg-moss-soft px-2 py-0.5 text-xs font-bold text-moss-ink">
                        🍽️ Made {r.times_made === 1 ? "once" : `${r.times_made} times`}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
