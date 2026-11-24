"use client";

import { useState } from "react";

/** Ingredients you can tap to cross off while you cook. */
export function IngredientList({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <ul className="space-y-1">
      {items.map((item, i) => {
        const checked = done.has(i);
        return (
          <li key={i}>
            <button
              type="button"
              aria-pressed={checked}
              onClick={() =>
                setDone((s) => {
                  const next = new Set(s);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
              className="flex w-full items-start gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-[#fcf4e8]"
            >
              <span
                aria-hidden
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-xs font-black ${
                  checked ? "border-moss bg-moss text-white" : "border-[#dcc7a8] bg-paper"
                }`}
              >
                {checked && "✓"}
              </span>
              <span className={checked ? "text-ink-soft line-through" : ""}>{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
      🖨️ Print
    </button>
  );
}
