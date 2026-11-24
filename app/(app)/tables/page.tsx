import Link from "next/link";
import { db } from "@/lib/supabase";
import { listGatherings } from "@/lib/data";
import { countdown, prettyDate } from "@/lib/format";
import { kindOf } from "@/lib/types";

export default async function TablesPage() {
  const gatherings = await listGatherings();
  const ids = gatherings.map((g) => g.id);

  // Small per-gathering tallies for the cards.
  const [rsvps, photos] = ids.length
    ? await Promise.all([
        db().from("lt_rsvps").select("gathering_id,adults,kids").eq("status", "yes").in("gathering_id", ids),
        db().from("lt_photos").select("gathering_id").in("gathering_id", ids),
      ])
    : [{ data: [] }, { data: [] }];
  const people = new Map<string, number>();
  for (const r of (rsvps.data ?? []) as { gathering_id: string; adults: number; kids: number }[]) {
    people.set(r.gathering_id, (people.get(r.gathering_id) ?? 0) + r.adults + r.kids);
  }
  const pics = new Map<string, number>();
  for (const p of (photos.data ?? []) as { gathering_id: string }[]) {
    pics.set(p.gathering_id, (pics.get(p.gathering_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Past tables</h1>
          <p className="text-ink-soft">Every gathering, where it was, and who was there.</p>
        </div>
        <Link href="/g/new" className="btn btn-primary">
          ＋ Set a new table
        </Link>
      </div>

      {gatherings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e2c9a8] bg-[#fffaf2] px-6 py-14 text-center text-ink-soft">
          <div className="text-5xl">📜</div>
          <p className="mt-3 font-semibold">No gatherings yet.</p>
        </div>
      ) : (
        <ul className="relative space-y-3 border-l-4 border-[#e2c9a8] pl-5 sm:pl-7">
          {gatherings.map((g) => {
            const kind = kindOf(g.kind);
            return (
              <li key={g.id} className="relative">
                <span className="absolute top-6 -left-[33px] grid h-6 w-6 place-items-center rounded-full border-4 border-bg bg-cone sm:-left-[41px]" />
                <Link href={`/g/${g.id}`} className="card block p-5 transition hover:border-marigold sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-2xl">
                        {kind.emoji} {g.title}
                      </h2>
                      <p className="text-ink-soft">
                        {[prettyDate(g.date), g.host && `hosted by ${g.host}`, g.place].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {g.date && (
                      <span className="rounded-full bg-pod px-3 py-1 text-sm font-bold text-pod-ink">
                        {countdown(g.date)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-4 text-sm font-bold text-ink-soft">
                    <span>🍽️ {people.get(g.id) ?? 0} at the table</span>
                    <span>📸 {pics.get(g.id) ?? 0} photos</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
