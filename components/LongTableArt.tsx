import type { Headcount } from "@/lib/types";

const MAX_SEATS = 48;

/**
 * The headcount drawn as a long table: one place setting per person, adults as
 * plates and kids as smaller plates, split along both sides.
 */
export function LongTableArt({ count }: { count: Headcount }) {
  const seats = [
    ...Array.from({ length: count.adults }, () => "adult" as const),
    ...Array.from({ length: count.kids }, () => "kid" as const),
  ];
  const shown = seats.slice(0, MAX_SEATS);
  const extra = seats.length - shown.length;
  const top = shown.filter((_, i) => i % 2 === 0);
  const bottom = shown.filter((_, i) => i % 2 === 1);

  const row = (list: typeof shown, offset: number) => (
    <div className="flex min-h-7 flex-wrap justify-center gap-1.5 px-3">
      {list.map((s, i) => (
        <span
          key={i}
          className={`seat grid place-items-center rounded-full border-2 border-[#e9cfb3] bg-[#fffaf2] shadow-sm ${
            s === "adult" ? "h-7 w-7" : "h-5 w-5 self-center"
          }`}
          style={{ animationDelay: `${(i * 2 + offset) * 25}ms` }}
          title={s === "adult" ? "Adult" : "Kid"}
        >
          <span className={`rounded-full ${s === "adult" ? "h-3.5 w-3.5 bg-[#f2c9a6]" : "h-2 w-2 bg-[#f7b98a]"}`} />
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden className="space-y-1.5">
      {row(top, 0)}
      <div className="tabletop relative mx-1 h-6 rounded-full shadow-[inset_0_-3px_0_rgba(0,0,0,.15)]">
        {seats.length === 0 && (
          <span className="absolute inset-0 grid place-items-center text-xs font-bold text-[#f6e8cf]/80">
            waiting for the first RSVP
          </span>
        )}
        {extra > 0 && (
          <span className="absolute inset-y-0 right-3 grid place-items-center text-xs font-extrabold text-[#f6e8cf]">
            +{extra} more
          </span>
        )}
      </div>
      {row(bottom, 1)}
    </div>
  );
}
