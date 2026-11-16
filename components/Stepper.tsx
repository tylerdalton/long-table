"use client";

import { useState } from "react";

/** A big-thumb number picker (− 3 +) that submits as a normal form field. */
export function Stepper({
  name,
  label,
  defaultValue,
  min = 0,
  max = 50,
}: {
  name: string;
  label: string;
  defaultValue: number;
  min?: number;
  max?: number;
}) {
  const [n, setN] = useState(defaultValue);
  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={n} />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-xl font-bold active:scale-95 disabled:opacity-40"
          onClick={() => setN((v) => Math.max(min, v - 1))}
          disabled={n <= min}
          aria-label={`One fewer ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="w-8 text-center text-2xl font-extrabold tabular-nums" aria-live="polite">
          {n}
        </span>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-xl font-bold active:scale-95 disabled:opacity-40"
          onClick={() => setN((v) => Math.min(max, v + 1))}
          disabled={n >= max}
          aria-label={`One more ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
