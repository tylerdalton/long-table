"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-3 text-left">
      <label className="label" htmlFor="passcode">
        Family passcode
      </label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        autoComplete="current-password"
        autoCapitalize="none"
        required
        className="field text-center text-lg tracking-wide"
        placeholder="••••••••"
      />
      {error && <p className="text-center text-sm font-semibold text-plum">{error}</p>}
      <button className="btn btn-primary w-full text-base" disabled={pending}>
        {pending ? "Setting your place…" : "Pull up a chair 🍂"}
      </button>
    </form>
  );
}
