"use client";

import { useTransition } from "react";

export function ConfirmButton({
  action,
  message,
  children,
  className = "btn btn-ghost text-rose-deep",
}: {
  action: () => Promise<void>;
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button className={className} disabled={pending} onClick={() => confirm(message) && start(action)}>
      {pending ? "Working…" : children}
    </button>
  );
}
