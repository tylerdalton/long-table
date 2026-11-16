import Link from "next/link";
import { getMembers, getPhotos, listGatherings } from "@/lib/data";
import { PhotoGrid } from "@/components/PhotoGrid";

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ g?: string; k?: string }> }) {
  const { g, k } = await searchParams;
  const [gatherings, members] = await Promise.all([listGatherings(), getMembers()]);
  const gathering = gatherings.find((x) => x.id === g);
  const kind = k === "art" || k === "photo" ? k : undefined;
  const photos = await getPhotos({ gatheringId: gathering?.id, kind });

  const href = (next: { g?: string | null; k?: string | null }) => {
    const params = new URLSearchParams();
    const gg = next.g === undefined ? gathering?.id : next.g;
    const kk = next.k === undefined ? kind : next.k;
    if (gg) params.set("g", gg);
    if (kk) params.set("k", kk);
    const s = params.toString();
    return s ? `/photos?${s}` : "/photos";
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{kind === "art" ? "The art gallery 🎨" : "Photos & art"}</h1>
          <p className="text-ink-soft">
            {kind === "art"
              ? "Rope's masterpieces (and anyone else's), year after year."
              : "Every picture from every table."}
          </p>
        </div>
        <Link href={`/photos/add${gathering ? `?g=${gathering.id}` : ""}${kind === "art" ? `${gathering ? "&" : "?"}k=art` : ""}`} className="btn btn-primary">
          📸 Add
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href={href({ k: null })} className="chip" aria-pressed={!kind}>
          Everything
        </Link>
        <Link href={href({ k: "photo" })} className="chip" aria-pressed={kind === "photo"}>
          📸 Photos
        </Link>
        <Link href={href({ k: "art" })} className="chip" aria-pressed={kind === "art"}>
          🎨 Art
        </Link>
        <span className="mx-1 w-px shrink-0 bg-line" />
        <Link href={href({ g: null })} className="chip" aria-pressed={!gathering}>
          All years
        </Link>
        {gatherings.map((x) => (
          <Link key={x.id} href={href({ g: x.id })} className="chip" aria-pressed={gathering?.id === x.id}>
            {x.title}
          </Link>
        ))}
      </div>

      {photos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e2c9a8] bg-[#fffaf2] px-6 py-14 text-center text-ink-soft">
          <div className="text-5xl">{kind === "art" ? "🎨" : "📸"}</div>
          <p className="mt-3 font-semibold">Nothing here yet.</p>
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          gatheringTitles={Object.fromEntries(gatherings.map((x) => [x.id, x.title]))}
          memberNames={Object.fromEntries(members.map((m) => [m.id, m.name]))}
        />
      )}
    </div>
  );
}
