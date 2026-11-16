"use client";

import { useActionState, useState } from "react";
import { createMember } from "@/app/actions";
import { EMOJIS } from "@/lib/types";

export function NewMemberForm() {
  const [error, action, pending] = useActionState(createMember, null);
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  return (
    <form action={action} className="mt-5 space-y-5">
      <div>
        <label className="label" htmlFor="name">
          Your name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={40}
          className="field"
          placeholder="What the family calls you, e.g. Rope"
        />
      </div>
      <div>
        <span className="label">Pick your place card</span>
        <input type="hidden" name="emoji" value={emoji} />
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setEmoji(e)}
              aria-pressed={emoji === e}
              aria-label={`Use ${e}`}
              className="h-11 w-11 rounded-full border border-line bg-paper text-2xl transition aria-pressed:scale-110 aria-pressed:border-berry-deep aria-pressed:bg-pumpkin-soft"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-berry-deep">{error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "That's me!"}
      </button>
    </form>
  );
}
