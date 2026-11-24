"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteRsvp, saveRsvp } from "@/app/actions";
import type { Rsvp, RsvpStatus } from "@/lib/types";
import { plural } from "@/lib/format";
import { Stepper } from "./Stepper";
import { Confetti } from "./Confetti";

const STATUSES: { id: RsvpStatus; label: string }[] = [
  { id: "yes", label: "We'll be there 🙌" },
  { id: "maybe", label: "Maybe 🤔" },
  { id: "no", label: "Can't make it 😢" },
];

function RsvpForm({
  gatheringId,
  rsvp,
  defaultParty,
  mine,
  onDone,
  onCancel,
}: {
  gatheringId: string;
  rsvp?: Rsvp;
  defaultParty?: string;
  mine?: boolean;
  onDone: (status: RsvpStatus) => void;
  onCancel?: () => void;
}) {
  const [status, setStatus] = useState<RsvpStatus>(rsvp?.status ?? "yes");
  const [error, action, pending] = useActionState(async (prev: string | null, form: FormData) => {
    const err = await saveRsvp(prev, form);
    if (!err) onDone(form.get("status") as RsvpStatus);
    return err;
  }, null);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="gathering_id" value={gatheringId} />
      {rsvp && <input type="hidden" name="id" value={rsvp.id} />}
      {mine && <input type="hidden" name="mine" value="on" />}
      <input type="hidden" name="status" value={status} />
      <div>
        <label className="label" htmlFor={`party-${rsvp?.id ?? "new"}`}>
          Name on the RSVP
        </label>
        <input
          id={`party-${rsvp?.id ?? "new"}`}
          name="party"
          required
          maxLength={80}
          defaultValue={rsvp?.party ?? defaultParty}
          className="field"
          placeholder="e.g. The Daltons, or Grandma & Grandpa"
        />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Are you coming?">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="chip"
            aria-pressed={status === s.id}
            onClick={() => setStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {status !== "no" && (
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stepper name="adults" label="Adults" defaultValue={rsvp?.adults ?? 2} />
          <Stepper name="kids" label="Kids" defaultValue={rsvp?.kids ?? 0} />
        </div>
      )}
      {status === "no" && (
        <>
          <input type="hidden" name="adults" value="0" />
          <input type="hidden" name="kids" value="0" />
        </>
      )}
      <div>
        <label className="label" htmlFor={`note-${rsvp?.id ?? "new"}`}>
          Anything we should know? <span className="font-semibold normal-case">(optional)</span>
        </label>
        <input
          id={`note-${rsvp?.id ?? "new"}`}
          name="note"
          maxLength={500}
          defaultValue={rsvp?.note ?? ""}
          className="field"
          placeholder="Allergies, arriving late, bringing a friend…"
        />
      </div>
      {error && <p className="text-sm font-semibold text-plum">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : rsvp ? "Save changes" : "Send RSVP"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function PartyRow({ rsvp, gatheringId, isMine }: { rsvp: Rsvp; gatheringId: string; isMine: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const badge =
    rsvp.status === "yes"
      ? "bg-moss-soft text-moss-ink"
      : rsvp.status === "maybe"
        ? "bg-pod text-pod-ink"
        : "bg-[#f1e4e4] text-[#8a4a52]";
  const counts =
    rsvp.status === "no"
      ? "Can't make it"
      : [plural(rsvp.adults, "adult"), rsvp.kids ? plural(rsvp.kids, "kid") : null].filter(Boolean).join(" · ");

  if (editing) {
    return (
      <li className="rounded-2xl border border-marigold/40 bg-[#fffaf2] p-4">
        <RsvpForm
          gatheringId={gatheringId}
          rsvp={rsvp}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
        <button
          type="button"
          className="mt-4 text-sm font-bold text-plum underline-offset-2 hover:underline"
          disabled={pending}
          onClick={() => confirm(`Remove ${rsvp.party}'s RSVP?`) && start(() => deleteRsvp(rsvp.id))}
        >
          {pending ? "Removing…" : "Remove this RSVP"}
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-bold">{rsvp.party}</span>
          {isMine && <span className="text-xs font-extrabold text-marigold">YOU</span>}
          <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${badge}`}>
            {rsvp.status === "yes" ? "Coming" : rsvp.status === "maybe" ? "Maybe" : "Not this year"}
          </span>
        </div>
        <div className="text-sm text-ink-soft">{counts}</div>
        {rsvp.note && <div className="mt-1 text-sm italic text-ink">“{rsvp.note}”</div>}
      </div>
      <button className="btn btn-ghost btn-sm shrink-0" onClick={() => setEditing(true)}>
        Edit
      </button>
    </li>
  );
}

export function RsvpSection({
  gatheringId,
  rsvps,
  meId,
  meName,
  isPast,
}: {
  gatheringId: string;
  rsvps: Rsvp[];
  meId: string;
  meName: string;
  isPast: boolean;
}) {
  const mine = rsvps.find((r) => r.member_id === meId);
  const [adding, setAdding] = useState(false);
  const [burst, setBurst] = useState(0);
  const others = rsvps.filter((r) => r !== mine);
  const order = { yes: 0, maybe: 1, no: 2 };
  const sorted = [...(mine ? [mine] : []), ...others.sort((a, b) => order[a.status] - order[b.status])];

  return (
    <section className="space-y-4">
      {burst > 0 && <Confetti key={burst} />}

      {!mine && !isPast && (
        <div className="card p-5 sm:p-6">
          <h3 className="font-display text-xl">Are you coming, {meName}?</h3>
          <p className="mb-4 text-sm text-ink-soft">One RSVP per household is perfect.</p>
          <RsvpForm
            gatheringId={gatheringId}
            defaultParty={meName}
            mine
            onDone={(s) => s === "yes" && setBurst((b) => b + 1)}
          />
        </div>
      )}

      {sorted.length > 0 && (
        <ul className="space-y-2">
          {sorted.map((r) => (
            <PartyRow key={r.id} rsvp={r} gatheringId={gatheringId} isMine={r === mine} />
          ))}
        </ul>
      )}

      {adding ? (
        <div className="card p-5 sm:p-6">
          <h3 className="font-display mb-4 text-xl">RSVP for someone else</h3>
          <RsvpForm gatheringId={gatheringId} onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <button className="btn btn-soft w-full sm:w-auto" onClick={() => setAdding(true)}>
          ＋ RSVP for someone else
        </button>
      )}
    </section>
  );
}
