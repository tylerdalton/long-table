import { courseEmoji, type Dish, type DishRole, type Member, type Rsvp } from "@/lib/types";
import { plural } from "@/lib/format";

const ROLE = {
  bring: { icon: "🍽️", verb: "Bringing" },
  buy: { icon: "🛒", verb: "Buying" },
  cook: { icon: "👨‍🍳", verb: "Cooking" },
} satisfies Record<DishRole, { icon: string; verb: string }>;

type Job = { dish: Dish; role: DishRole };
type Person = {
  key: string;
  name: string;
  member: Member | null;
  rsvp: Rsvp | null;
  jobs: Job[];
};

const keyOf = (name: string) => name.trim().toLowerCase();

/**
 * Everyone's commitments in one place: each person with what they're
 * bringing, buying or cooking. People are matched by name, so "Rope" typed in
 * with "Someone else" lands on the same card as Rope's own account. Members
 * who RSVP'd yes but haven't signed up for anything show up too, so the host
 * can see who to ask.
 */
export function ByPerson({
  dishes,
  members,
  rsvps,
  meId,
}: {
  dishes: Dish[];
  members: Member[];
  rsvps: Rsvp[];
  meId: string;
}) {
  const people = new Map<string, Person>();
  const memberById = new Map(members.map((m) => [m.id, m]));
  const person = (name: string, memberId: string | null) => {
    const member = (memberId && memberById.get(memberId)) || members.find((m) => keyOf(m.name) === keyOf(name)) || null;
    const display = member?.name ?? name.trim();
    const key = keyOf(display);
    let p = people.get(key);
    if (!p) {
      p = { key, name: display, member, rsvp: null, jobs: [] };
      people.set(key, p);
    }
    if (!p.member && member) p.member = member;
    return p;
  };

  for (const d of dishes) {
    if (d.bringer) person(d.bringer, d.bringer_member_id).jobs.push({ dish: d, role: d.split ? "cook" : "bring" });
    if (d.split && d.buyer) person(d.buyer, d.buyer_member_id).jobs.push({ dish: d, role: "buy" });
  }
  for (const r of rsvps) {
    if (r.status === "no") continue;
    const owner = r.member_id ? memberById.get(r.member_id) : null;
    const p = owner ? person(owner.name, owner.id) : people.get(keyOf(r.party));
    if (p) p.rsvp = r;
    else if (r.status === "yes") person(r.party, null).rsvp = r;
  }

  const isMe = (p: Person) => p.member?.id === meId;
  const list = [...people.values()].sort(
    (a, b) =>
      Number(isMe(b)) - Number(isMe(a)) ||
      Number(b.jobs.length > 0) - Number(a.jobs.length > 0) ||
      a.name.localeCompare(b.name),
  );

  const open: { dish: Dish; need: string }[] = [];
  for (const d of dishes) {
    if (!d.split && !d.bringer) open.push({ dish: d, need: "someone to bring it" });
    if (d.split && !d.buyer && !d.bringer) open.push({ dish: d, need: "a buyer and a cook" });
    else if (d.split && !d.buyer) open.push({ dish: d, need: "a buyer" });
    else if (d.split && !d.bringer) open.push({ dish: d, need: "a cook" });
  }

  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#e2c9a8] bg-[#fffaf2] px-6 py-8 text-center text-ink-soft">
          <div className="text-4xl">🙋</div>
          <p className="mt-2 font-semibold">No one has signed up for anything yet.</p>
        </div>
      )}

      {list.map((p) => (
        <div
          key={p.key}
          className={`rounded-2xl border px-4 py-3 ${isMe(p) ? "border-moss/50 bg-moss-soft/60" : "border-line bg-paper"}`}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-marigold-soft text-xl">
              {p.member?.emoji ?? "👤"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-lg font-bold">{p.name}</span>
                {isMe(p) && <span className="text-xs font-extrabold text-marigold">YOU</span>}
              </div>
              <div className="text-sm text-ink-soft">
                {p.jobs.length ? plural(p.jobs.length, "job") : "Nothing signed up yet"}
                {p.rsvp && (
                  <>
                    {" · "}
                    {p.rsvp.status === "maybe" ? "Maybe coming" : "Coming"}
                    {p.rsvp.party !== p.name && ` with ${p.rsvp.party}`}
                  </>
                )}
              </div>
            </div>
          </div>
          {p.jobs.length > 0 && (
            <ul className="mt-2.5 space-y-1.5 border-t border-line/70 pt-2.5">
              {p.jobs.map(({ dish, role }) => (
                <li key={`${dish.id}-${role}`} className="flex items-baseline gap-2">
                  <span className="w-5 shrink-0 text-center" aria-hidden>
                    {ROLE[role].icon}
                  </span>
                  <span>
                    <span className="text-sm font-bold text-ink-soft">{ROLE[role].verb}</span>{" "}
                    <span className="font-semibold">{dish.name}</span>
                    {dish.note && <span className="text-sm text-ink-soft italic"> · {dish.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {open.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[#e2c9a8] bg-[#fffaf2] px-4 py-3">
          <div className="text-sm font-extrabold tracking-wide text-marigold uppercase">Still needs someone</div>
          <ul className="mt-2 space-y-1">
            {open.map(({ dish, need }) => (
              <li key={dish.id} className="flex items-baseline gap-2">
                <span className="w-5 shrink-0 text-center" aria-hidden>
                  {courseEmoji(dish.course)}
                </span>
                <span>
                  <span className="font-semibold">{dish.name}</span>
                  <span className="text-sm text-ink-soft"> needs {need}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-soft">Switch to “By course” to sign up.</p>
        </div>
      )}
    </div>
  );
}
