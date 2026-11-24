import { redirect } from "next/navigation";
import { getMe, getMembers } from "@/lib/data";
import { deleteMember, logout, switchPerson } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function SettingsPage() {
  const [me, members] = await Promise.all([getMe(), getMembers()]);
  if (!me) redirect("/who");
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-6">
      <section className="card flex flex-wrap items-center gap-4 p-6">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-marigold-soft text-4xl">{me.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="label mb-0">Signed in as</div>
          <div className="font-display text-3xl">{me.name}</div>
        </div>
        <div className="flex gap-2">
          <form action={switchPerson}>
            <button className="btn btn-ghost btn-sm">Not you?</button>
          </form>
          <form action={logout}>
            <button className="btn btn-ghost btn-sm">Sign out</button>
          </form>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title mb-1">The family</h2>
        <p className="mb-4 text-sm text-ink-soft">Everyone who has pulled up a chair on the app.</p>
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <span className="text-2xl">{m.emoji}</span>
              <span className="flex-1 font-bold">
                {m.name} {m.id === me.id && <span className="text-xs font-extrabold text-marigold">YOU</span>}
              </span>
              <ConfirmButton
                action={deleteMember.bind(null, m.id)}
                message={`Remove ${m.name} from the app? Their RSVPs, dishes and photos stay.`}
                className="btn btn-ghost btn-sm text-plum"
              >
                Remove
              </ConfirmButton>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
