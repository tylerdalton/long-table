import { chooseMember } from "@/app/actions";
import { getMembers } from "@/lib/data";
import { Leaves } from "@/components/Leaves";
import { Logo } from "@/components/Logo";
import { NewMemberForm } from "./NewMemberForm";

export default async function WhoPage() {
  const members = await getMembers();
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 pt-10 pb-28">
      <Leaves />
      <div aria-hidden className="painted-board fixed inset-x-0 bottom-0 h-20 shadow-[0_-6px_20px_-8px_rgba(0,0,0,.35)] sm:h-24" />
      <div className="card pop-in relative w-full max-w-lg px-6 py-8 sm:px-10">
        <div className="text-center">
          <Logo />
          <h1 className="font-display mt-6 text-3xl">Who&apos;s at the table?</h1>
          <p className="mt-1 text-ink-soft">So we know who signed up for the pie.</p>
        </div>

        {members.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {members.map((m) => (
              <form key={m.id} action={chooseMember.bind(null, m.id)}>
                <button className="flex w-full items-center gap-3 rounded-2xl border border-line bg-[#fffaf2] px-4 py-4 text-left font-bold transition hover:border-marigold active:scale-[.97]">
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="truncate text-lg">{m.name}</span>
                </button>
              </form>
            ))}
          </div>
        )}

        <details className="group mt-6" open={members.length === 0}>
          <summary className="btn btn-soft w-full cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            {members.length === 0 ? "Set the first place 🍽️" : "I'm new here 🍽️"}
          </summary>
          <NewMemberForm />
        </details>
      </div>
    </main>
  );
}
