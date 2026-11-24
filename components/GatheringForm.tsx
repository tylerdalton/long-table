"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveGathering } from "@/app/actions";
import { KINDS, type Gathering } from "@/lib/types";

export function GatheringForm({
  gathering,
  defaults,
}: {
  gathering?: Gathering;
  defaults?: { title: string; date: string };
}) {
  const [error, action, pending] = useActionState(saveGathering, null);
  const [kind, setKind] = useState(gathering?.kind ?? "thanksgiving");
  const isNew = !gathering;

  return (
    <form action={action} className="space-y-6 pb-28 md:pb-0">
      {gathering && <input type="hidden" name="id" value={gathering.id} />}
      <input type="hidden" name="kind" value={kind} />

      <div className="card space-y-6 p-5 sm:p-8">
        <div>
          <span className="label">What kind of gathering?</span>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
                {k.emoji} {k.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="title">
            Name
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={80}
            defaultValue={gathering?.title ?? defaults?.title}
            className="field text-lg font-semibold"
            placeholder="Thanksgiving 2026"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="date">
              Date
            </label>
            <input id="date" name="date" type="date" defaultValue={gathering?.date ?? defaults?.date} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="time_note">
              Time
            </label>
            <input
              id="time_note"
              name="time_note"
              maxLength={120}
              defaultValue={gathering?.time_note ?? ""}
              className="field"
              placeholder="Come at 1, dinner at 2:30"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="host">
              Hosted by
            </label>
            <input
              id="host"
              name="host"
              maxLength={120}
              defaultValue={gathering?.host ?? ""}
              className="field"
              placeholder="Grandma & Grandpa"
            />
          </div>
          <div>
            <label className="label" htmlFor="place">
              Where
            </label>
            <input
              id="place"
              name="place"
              maxLength={120}
              defaultValue={gathering?.place ?? ""}
              className="field"
              placeholder="The farmhouse"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="address">
            Address <span className="font-semibold normal-case">(optional, for directions)</span>
          </label>
          <input id="address" name="address" maxLength={240} defaultValue={gathering?.address ?? ""} className="field" />
        </div>

        <div>
          <label className="label" htmlFor="notes">
            Notes for everyone <span className="font-semibold normal-case">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={gathering?.notes ?? ""}
            className="field"
            placeholder="Park on the grass. Bring a chair if you have one. Football at 4!"
          />
        </div>

        {isNew && kind === "thanksgiving" && (
          <label className="flex items-start gap-3 rounded-2xl bg-moss-soft px-4 py-3">
            <input type="checkbox" name="classic_menu" defaultChecked className="mt-1 h-5 w-5 accent-[#2f8a3c]" />
            <span>
              <span className="font-bold">Start with the classic Thanksgiving menu</span>
              <span className="block text-sm text-ink-soft">
                Turkey, stuffing, potatoes, pies and more, ready for people to claim. You can remove or add dishes anytime.
              </span>
            </span>
          </label>
        )}
      </div>

      {error && <p className="text-center font-semibold text-plum">{error}</p>}

      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-2xl gap-2 md:max-w-none">
          <Link href={gathering ? `/g/${gathering.id}` : "/"} className="btn btn-ghost">
            Cancel
          </Link>
          <button className="btn btn-primary flex-1 md:flex-none" disabled={pending}>
            {pending ? "Saving…" : isNew ? "Set the table 🍽️" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
