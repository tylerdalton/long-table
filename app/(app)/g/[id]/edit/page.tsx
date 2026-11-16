import { notFound } from "next/navigation";
import { getGathering } from "@/lib/data";
import { deleteGathering } from "@/app/actions";
import { GatheringForm } from "@/components/GatheringForm";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function EditGatheringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gathering = await getGathering(id);
  if (!gathering) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display mb-5 text-3xl sm:text-4xl">Edit {gathering.title}</h1>
      <GatheringForm gathering={gathering} />
      <div className="mt-10 mb-28 border-t border-line pt-6 text-center md:mb-0">
        <ConfirmButton
          action={deleteGathering.bind(null, gathering.id)}
          message={`Delete ${gathering.title}? This removes its RSVPs, menu and every photo. It can't be undone.`}
        >
          Delete this gathering
        </ConfirmButton>
      </div>
    </div>
  );
}
