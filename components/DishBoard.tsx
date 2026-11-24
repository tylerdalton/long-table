"use client";

import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import { addDish, assignDish, claimDish, deleteDish, setDishSplit } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { COURSES, courseEmoji, isCovered, type Dish, type DishRole, type Member, type Rsvp } from "@/lib/types";
import { ByPerson } from "./ByPerson";
import { Confetti } from "./Confetti";

const ROLE_TEXT: Record<DishRole, { icon: string; claim: string; me: string; them: string; open: string; ask: string }> = {
  bring: { icon: "", claim: "I'll bring it", me: "You're bringing this", them: "is bringing it", open: "Still needed", ask: "bringing" },
  buy: { icon: "🛒", claim: "I'll buy it", me: "You're buying it", them: "is buying it", open: "Needs a buyer", ask: "buying" },
  cook: { icon: "👨‍🍳", claim: "I'll cook it", me: "You're cooking it", them: "is cooking it", open: "Needs a cook", ask: "cooking" },
};

/** One job on a dish (the whole thing, or the buying or cooking half): who has it, and the buttons to change that. */
function Job({
  dish,
  role,
  meId,
  pending,
  start,
  onClaimed,
  extra,
}: {
  dish: Dish;
  role: DishRole;
  meId: string;
  pending: boolean;
  start: (fn: () => Promise<void>) => void;
  onClaimed: () => void;
  extra?: React.ReactNode;
}) {
  const text = ROLE_TEXT[role];
  const who = role === "buy" ? dish.buyer : dish.bringer;
  const whoId = role === "buy" ? dish.buyer_member_id : dish.bringer_member_id;
  const mine = Boolean(who) && whoId === meId;

  const someoneElse = () => {
    const name = prompt(`Who's ${text.ask} the ${dish.name}?`, "");
    if (name?.trim()) start(() => assignDish(dish.id, role, name));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="text-sm">
        {text.icon && <span className="mr-1.5">{text.icon}</span>}
        {!who ? (
          <span className="font-semibold text-marigold">{text.open}</span>
        ) : mine ? (
          <span className="font-semibold text-moss-ink">{text.me} ✓</span>
        ) : (
          <span className="text-ink-soft">
            <span className="font-semibold text-ink">{who}</span>{" "}
            {/\s(&|and)\s/i.test(who) ? text.them.replace(/^is /, "are ") : text.them}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {!who ? (
          <>
            <button
              className="btn btn-primary btn-sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await claimDish(dish.id, role, true);
                  onClaimed();
                })
              }
            >
              {text.claim}
            </button>
            <button className="btn btn-ghost btn-sm" disabled={pending} onClick={someoneElse}>
              Someone else
            </button>
          </>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            disabled={pending}
            onClick={() =>
              (mine || confirm(`Take ${who} off ${text.ask} the ${dish.name}?`)) &&
              start(() => claimDish(dish.id, role, false))
            }
          >
            {mine ? "Let it go" : "Unassign"}
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}

function DishRow({ dish, meId, onClaimed }: { dish: Dish; meId: string; onClaimed: () => void }) {
  const [pending, startTransition] = useTransition();
  const start = (fn: () => Promise<void>) => startTransition(fn);
  const covered = isCovered(dish);
  const involved = dish.bringer_member_id === meId || dish.buyer_member_id === meId;
  const jobProps = { dish, meId, pending, start, onClaimed };

  return (
    <li
      className={`rounded-2xl border px-4 py-3 transition ${
        !covered
          ? "border-dashed border-[#e2c9a8] bg-[#fffaf2]"
          : involved
            ? "border-moss/50 bg-moss-soft/60"
            : "border-line bg-paper"
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-bold">
            {dish.name}
            {dish.split && (
              <span className="ml-2 rounded-full bg-pod px-2 py-0.5 align-middle text-[11px] font-extrabold text-pod-ink uppercase">
                Split
              </span>
            )}
          </div>
          {dish.note && <div className="text-sm text-ink-soft italic">{dish.note}</div>}
        </div>
        {dish.recipe_id ? (
          <Link
            href={`/recipes/${dish.recipe_id}`}
            className="shrink-0 rounded-full bg-pod px-3 py-1.5 text-xs font-extrabold text-pod-ink hover:bg-[#e4d8bd]"
          >
            📖 Recipe
          </Link>
        ) : (
          <Link
            href={`/recipes/new?dish=${dish.id}`}
            className="shrink-0 rounded-full border border-dashed border-[#e2c9a8] px-3 py-1.5 text-xs font-bold text-ink-soft hover:border-marigold hover:text-ink"
          >
            ＋ Recipe
          </Link>
        )}
        <button
          className="-mt-1 -mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-[#f6ece0] hover:text-plum"
          disabled={pending}
          aria-label={`Remove ${dish.name} from the menu`}
          title="Remove from the menu"
          onClick={() => confirm(`Remove “${dish.name}” from the menu?`) && start(() => deleteDish(dish.id))}
        >
          ✕
        </button>
      </div>

      {dish.split ? (
        <div className="mt-2 space-y-2 border-l-2 border-[#ecd9bf] pl-3">
          <Job {...jobProps} role="buy" />
          <Job {...jobProps} role="cook" />
          <button
            className="text-xs font-bold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            disabled={pending}
            onClick={() => start(() => setDishSplit(dish.id, false))}
          >
            One person can do both
          </button>
        </div>
      ) : (
        <div className="mt-1.5">
          <Job
            {...jobProps}
            role="bring"
            extra={
              <button
                className="btn btn-ghost btn-sm"
                disabled={pending}
                onClick={() => start(() => setDishSplit(dish.id, true))}
              >
                Split it
              </button>
            }
          />
        </div>
      )}
    </li>
  );
}

function AddDishForm({ gatheringId, onAdded }: { gatheringId: string; onAdded: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, action, pending] = useActionState(async (prev: string | null, form: FormData) => {
    const err = await addDish(prev, form);
    if (!err) {
      formRef.current?.reset();
      onAdded();
    }
    return err;
  }, null);
  return (
    <form ref={formRef} action={action} className="card space-y-4 p-5 sm:p-6">
      <h3 className="font-display text-xl">Add to the menu</h3>
      <input type="hidden" name="gathering_id" value={gatheringId} />
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div>
          <label className="label" htmlFor="course">
            Course
          </label>
          <select id="course" name="course" className="field" defaultValue="Sides">
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="dish-name">
            Dish
          </label>
          <input id="dish-name" name="name" required maxLength={120} className="field" placeholder="e.g. Grandma's rolls" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="dish-note">
          Note <span className="font-semibold normal-case">(optional)</span>
        </label>
        <input id="dish-note" name="note" maxLength={300} className="field" placeholder="Gluten-free, needs oven space at 4pm…" />
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-moss-soft px-4 py-3 font-bold">
        <input type="checkbox" name="mine" defaultChecked className="h-5 w-5 accent-[#2f8a3c]" />
        I&apos;m bringing this
      </label>
      {error && <p className="text-sm font-semibold text-plum">{error}</p>}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Adding…" : "Add dish"}
      </button>
    </form>
  );
}

export function DishBoard({
  gatheringId,
  dishes,
  members,
  rsvps,
  meId,
}: {
  gatheringId: string;
  dishes: Dish[];
  members: Member[];
  rsvps: Rsvp[];
  meId: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get("menu") === "people" ? "people" : "course";
  const setView = (v: "course" | "people") => {
    const next = new URLSearchParams(params);
    if (v === "people") next.set("menu", "people");
    else next.delete("menu");
    const qs = next.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const [burst, setBurst] = useState(0);
  const [adding, setAdding] = useState(false);
  const known = new Set(COURSES.map((c) => c.id));
  const courses = [
    ...COURSES.map((c) => c.id),
    ...Array.from(new Set(dishes.map((d) => d.course).filter((c) => !known.has(c)))),
  ];
  const celebrate = () => setBurst((b) => b + 1);

  const toggle = (
    <div role="group" aria-label="Show the menu" className="flex gap-2">
      <button className="chip" aria-pressed={view === "course"} onClick={() => setView("course")}>
        🍽️ By course
      </button>
      <button className="chip" aria-pressed={view === "people"} onClick={() => setView("people")}>
        🙋 By person
      </button>
    </div>
  );

  if (view === "people") {
    return (
      <section className="space-y-5">
        {toggle}
        <ByPerson dishes={dishes} members={members} rsvps={rsvps} meId={meId} />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {burst > 0 && <Confetti key={burst} />}
      {dishes.length > 0 && toggle}
      {dishes.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#e2c9a8] bg-[#fffaf2] px-6 py-8 text-center text-ink-soft">
          <div className="text-4xl">🍽️</div>
          <p className="mt-2 font-semibold">The menu is empty. Add the first dish below.</p>
        </div>
      )}
      {courses.map((course) => {
        const list = dishes.filter((d) => d.course === course);
        if (!list.length) return null;
        return (
          <div key={course}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold tracking-wide text-ink-soft uppercase">
              <span className="text-lg">{courseEmoji(course)}</span> {course}
            </h3>
            <ul className="space-y-2">
              {list.map((d) => (
                <DishRow key={d.id} dish={d} meId={meId} onClaimed={celebrate} />
              ))}
            </ul>
          </div>
        );
      })}
      {adding ? (
        <AddDishForm gatheringId={gatheringId} onAdded={() => setAdding(false)} />
      ) : (
        <button className="btn btn-soft w-full sm:w-auto" onClick={() => setAdding(true)}>
          ＋ Add a dish
        </button>
      )}
    </section>
  );
}
