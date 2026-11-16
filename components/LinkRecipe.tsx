"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { linkDishRecipe } from "@/app/actions";

/** "Already in the box?" Link a dish to an existing recipe instead of writing a new one. */
export function LinkRecipe({
  dishId,
  dishName,
  recipes,
}: {
  dishId: string;
  dishName: string;
  recipes: { id: string; title: string; from_whom: string | null }[];
}) {
  const router = useRouter();
  const [choice, setChoice] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-xl">Already in the Recipe Box?</h2>
      <p className="mb-3 text-sm text-ink-soft">Link the {dishName} to a recipe the family already saved.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select className="field" value={choice} onChange={(e) => setChoice(e.target.value)} aria-label="Pick a recipe">
          <option value="">Pick a recipe…</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
              {r.from_whom ? ` (from ${r.from_whom})` : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-soft shrink-0"
          disabled={!choice || pending}
          onClick={() =>
            start(async () => {
              await linkDishRecipe(dishId, choice);
              router.push(`/recipes/${choice}`);
            })
          }
        >
          {pending ? "Linking…" : "Link it"}
        </button>
      </div>
    </div>
  );
}
