"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "This Year", icon: "🦃" },
  { href: "/recipes", label: "Recipes", icon: "📖" },
  { href: "/photos", label: "Photos", icon: "🖼️" },
  { href: "/tables", label: "Past Tables", icon: "📜" },
];

function useActive() {
  const path = usePathname();
  return (href: string) =>
    href === "/"
      ? path === "/"
      : href === "/photos"
        ? path === "/photos"
        : href === "/tables"
          ? path.startsWith("/tables") || path.startsWith("/g/")
          : path.startsWith(href);
}

export function TopNav() {
  const isActive = useActive();
  return (
    <nav className="hidden flex-1 items-center justify-end gap-1 md:flex">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-full px-4 py-2 text-[15px] font-bold transition ${
            isActive(l.href) ? "bg-pumpkin-soft text-[#9a4a17]" : "text-ink-soft hover:text-ink"
          }`}
        >
          {l.label}
        </Link>
      ))}
      <Link href="/photos/add" className="btn btn-primary ml-2">
        📸 Add photos
      </Link>
    </nav>
  );
}

export function BottomNav() {
  const isActive = useActive();
  const path = usePathname();
  // Forms have their own sticky Save bar at the bottom of the screen.
  if (path === "/photos/add" || path.endsWith("/edit") || path === "/g/new" || path === "/recipes/new") return null;
  const tab = (l: (typeof LINKS)[number]) => (
    <Link
      key={l.href}
      href={l.href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold tracking-wide ${
        isActive(l.href) ? "text-berry-deep" : "text-ink-soft"
      }`}
    >
      <span className={`text-[22px] transition ${isActive(l.href) ? "scale-110" : "opacity-70 grayscale-[.4]"}`}>
        {l.icon}
      </span>
      {l.label}
    </Link>
  );
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-end px-2">
        {tab(LINKS[0])}
        {tab(LINKS[1])}
        <div className="flex flex-1 justify-center">
          <Link
            href="/photos/add"
            aria-label="Add photos"
            className="-mt-7 grid h-16 w-16 place-items-center rounded-full border-4 border-bg bg-berry-deep text-3xl text-white shadow-[0_10px_24px_-8px_#8f2b37] transition active:scale-95"
          >
            📸
          </Link>
        </div>
        {tab(LINKS[2])}
        {tab(LINKS[3])}
      </div>
    </nav>
  );
}
