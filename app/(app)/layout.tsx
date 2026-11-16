import Link from "next/link";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/data";
import { Logo } from "@/components/Logo";
import { BottomNav, TopNav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) redirect("/who");
  return (
    <div className="min-h-dvh pb-28 md:pb-12">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="The Long Table, home">
            <Logo />
          </Link>
          <TopNav />
          <Link
            href="/settings"
            title="You"
            className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper p-1 text-sm font-bold sm:pr-3"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-pumpkin-soft text-lg">{me.emoji}</span>
            <span className="hidden sm:inline">{me.name}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}
