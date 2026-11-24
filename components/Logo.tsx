import { RopeTurkey } from "./RopeTurkey";

/** The wordmark. `md` sits in the header with Rope's turkey beside it; `lg` stands over a row of seed pods. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  if (size === "lg") {
    return (
      <span className="inline-flex flex-col items-center leading-none">
        <span className="font-display text-5xl text-plum italic sm:text-6xl">The Long Table</span>
        <span aria-hidden className="pod-rule mt-3 w-56 sm:w-64" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 leading-none">
      <RopeTurkey className="h-11 w-11 shrink-0 -translate-y-0.5" />
      <span className="font-display text-[22px] text-plum italic sm:text-2xl">The Long Table</span>
    </span>
  );
}
