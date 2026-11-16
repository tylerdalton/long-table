import Link from "next/link";
import { getCurrentGathering, listGatherings } from "@/lib/data";
import { PhotoUploader } from "@/components/PhotoUploader";

export default async function AddPhotosPage({ searchParams }: { searchParams: Promise<{ g?: string; k?: string }> }) {
  const { g, k } = await searchParams;
  const [gatherings, current] = await Promise.all([listGatherings(), getCurrentGathering()]);

  if (!gatherings.length) {
    return (
      <div className="card mx-auto mt-6 max-w-md px-6 py-10 text-center">
        <div className="text-5xl">📸</div>
        <p className="mt-3 font-semibold">Photos belong to a gathering. Set the table first!</p>
        <Link href="/g/new" className="btn btn-primary mt-6">
          Set the table
        </Link>
      </div>
    );
  }

  const defaultId = gatherings.some((x) => x.id === g) ? g! : (current?.id ?? gatherings[0].id);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display mb-5 text-3xl sm:text-4xl">Add photos &amp; art</h1>
      <PhotoUploader
        gatherings={gatherings.map(({ id, title }) => ({ id, title }))}
        defaultGatheringId={defaultId}
        defaultKind={k === "art" ? "art" : "photo"}
      />
    </div>
  );
}
