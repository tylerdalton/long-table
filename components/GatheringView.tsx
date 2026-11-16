import Link from "next/link";
import { getDishes, getMembers, getPhotos, getRsvps, headcount } from "@/lib/data";
import { countdown, daysUntil, plural, prettyDate } from "@/lib/format";
import { isCovered, kindOf, type Gathering, type Member } from "@/lib/types";
import { LongTableArt } from "./LongTableArt";
import { RsvpSection } from "./RsvpSection";
import { DishBoard } from "./DishBoard";

export async function GatheringView({ gathering: g, me }: { gathering: Gathering; me: Member }) {
  const [rsvps, dishes, photos, members] = await Promise.all([
    getRsvps(g.id),
    getDishes(g.id),
    getPhotos({ gatheringId: g.id, limit: 12 }),
    getMembers(),
  ]);
  const count = headcount(rsvps);
  const kind = kindOf(g.kind);
  const days = daysUntil(g.date);
  const isPast = days !== null && days < -3;
  const claimed = dishes.filter(isCovered).length;
  const open = dishes.length - claimed;
  const names = (list: typeof dishes) => list.map((d) => d.name).join(", ");
  const myJobs = [
    { label: "You're bringing", list: dishes.filter((d) => !d.split && d.bringer_member_id === me.id) },
    { label: "You're buying", list: dishes.filter((d) => d.split && d.buyer_member_id === me.id) },
    { label: "You're cooking", list: dishes.filter((d) => d.split && d.bringer_member_id === me.id) },
  ].filter((j) => j.list.length);

  return (
    <div className="space-y-8 pb-6">
      {/* Hero */}
      <section className="card relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-6 -right-4 text-[120px] opacity-[.08] sm:text-[160px]">
          {kind.emoji}
        </div>
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {g.date && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-pumpkin-soft px-3 py-1 text-sm font-extrabold text-[#9a4a17]">
                {countdown(g.date)}
              </div>
            )}
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              <span className="mr-2">{kind.emoji}</span>
              {g.title}
            </h1>
            <div className="mt-2 space-y-1 text-[17px] text-ink-soft">
              {g.date && <div className="font-semibold text-ink">{prettyDate(g.date)}</div>}
              {g.time_note && <div>🕑 {g.time_note}</div>}
              {(g.host || g.place) && (
                <div>
                  🏡 {g.host && <>Hosted by <span className="font-semibold text-ink">{g.host}</span></>}
                  {g.host && g.place && " at "}
                  {g.place && <span className="font-semibold text-ink">{g.place}</span>}
                </div>
              )}
              {g.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(g.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-semibold text-berry-deep underline-offset-2 hover:underline"
                >
                  📍 {g.address}
                </a>
              )}
            </div>
            {g.notes && <p className="mt-3 max-w-2xl whitespace-pre-line text-ink">{g.notes}</p>}
          </div>
          <Link href={`/g/${g.id}/edit`} className="btn btn-ghost btn-sm shrink-0">
            ✏️ Edit details
          </Link>
        </div>
      </section>

      {/* Headcount */}
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="label mb-1">Headcount</div>
            <div className="font-display text-5xl leading-none text-berry-deep sm:text-6xl">
              {count.total}
              <span className="ml-2 text-2xl text-ink sm:text-3xl">{count.total === 1 ? "person" : "people"}</span>
            </div>
            <div className="mt-2 text-ink-soft">
              {plural(count.adults, "adult")} · {plural(count.kids, "kid")}
              {count.maybe > 0 && <span className="text-[#8a6418]"> · {count.maybe} more maybe</span>}
            </div>
          </div>
          {dishes.length > 0 && (
            <div className="sm:text-right">
              <div className="label mb-1">Menu</div>
              <div className="text-lg font-bold">
                {claimed} of {dishes.length} dishes covered
              </div>
              {open > 0 ? (
                <div className="text-sm font-semibold text-pumpkin">{open} still {open === 1 ? "needs" : "need"} someone</div>
              ) : (
                <div className="text-sm font-semibold text-[#4d6640]">Everything&apos;s covered! 🎉</div>
              )}
            </div>
          )}
        </div>
        <div className="mt-6">
          <LongTableArt count={count} />
        </div>
        {myJobs.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-sage-soft px-4 py-3 text-[15px]">
            <div className="space-y-0.5">
              {myJobs.map((j) => (
                <p key={j.label}>
                  <span className="font-bold">{j.label}:</span> {names(j.list)}
                </p>
              ))}
            </div>
            <Link href="?menu=people#menu" scroll={false} className="text-sm font-bold text-[#4d6640] underline-offset-2 hover:underline">
              Everyone&apos;s list →
            </Link>
          </div>
        )}
        {myJobs.length === 0 && dishes.some((d) => d.bringer || d.buyer) && (
          <div className="mt-5 text-right">
            <Link href="?menu=people#menu" scroll={false} className="text-sm font-bold text-berry-deep underline-offset-2 hover:underline">
              See who&apos;s bringing what →
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="section-title mb-4">Who&apos;s coming</h2>
          <RsvpSection gatheringId={g.id} rsvps={rsvps} meId={me.id} meName={me.name} isPast={isPast} />
        </div>
        <div id="menu" className="scroll-mt-20">
          <h2 className="section-title mb-4">What we&apos;re eating</h2>
          <DishBoard gatheringId={g.id} dishes={dishes} members={members} rsvps={rsvps} meId={me.id} />
        </div>
      </div>

      {/* Photos */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Photos &amp; art</h2>
          <div className="flex gap-2">
            {photos.length > 0 && (
              <Link href={`/photos?g=${g.id}`} className="btn btn-ghost btn-sm">
                See all
              </Link>
            )}
            <Link href={`/photos/add?g=${g.id}`} className="btn btn-primary btn-sm">
              📸 Add photos
            </Link>
          </div>
        </div>
        {photos.length === 0 ? (
          <Link
            href={`/photos/add?g=${g.id}`}
            className="block rounded-3xl border border-dashed border-[#e2c9a8] bg-[#fffaf2] px-6 py-10 text-center text-ink-soft transition hover:border-pumpkin"
          >
            <div className="text-4xl">📸 🎨</div>
            <p className="mt-2 font-semibold">No photos yet. Add pictures from the day, and Rope&apos;s art too.</p>
          </Link>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {photos.map((p) => (
              <Link
                key={p.id}
                href={`/photos?g=${g.id}#${p.id}`}
                className="relative aspect-square w-36 shrink-0 overflow-hidden rounded-2xl border border-line bg-butter sm:w-auto"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={p.caption ?? (p.kind === "art" ? "Art" : "Photo")} className="h-full w-full object-cover" loading="lazy" />
                {p.kind === "art" && (
                  <span className="absolute top-2 left-2 rounded-full bg-paper/90 px-2 py-0.5 text-xs font-extrabold">
                    🎨 {p.artist ?? "Art"}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
