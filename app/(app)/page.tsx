import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentGathering, getMe } from "@/lib/data";
import { nextThanksgiving, yearOf } from "@/lib/format";
import { GatheringView } from "@/components/GatheringView";

export default async function Home() {
  const [me, current] = await Promise.all([getMe(), getCurrentGathering()]);
  if (!me) redirect("/who");

  if (!current) {
    const year = yearOf(nextThanksgiving());
    return (
      <div className="card pop-in mx-auto mt-6 max-w-xl px-6 py-12 text-center sm:px-10">
        <div className="text-6xl">🦃</div>
        <h1 className="font-display mt-4 text-3xl sm:text-4xl">Let&apos;s set the table</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">
          Start with Thanksgiving {year}: where it is, who&apos;s coming, and who&apos;s bringing what.
        </p>
        <Link href="/g/new" className="btn btn-primary mt-7 text-base">
          Set the table for Thanksgiving {year}
        </Link>
      </div>
    );
  }

  return <GatheringView gathering={current} me={me} />;
}
