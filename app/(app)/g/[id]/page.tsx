import { notFound, redirect } from "next/navigation";
import { getGathering, getMe } from "@/lib/data";
import { GatheringView } from "@/components/GatheringView";

export default async function GatheringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [me, gathering] = await Promise.all([getMe(), getGathering(id)]);
  if (!me) redirect("/who");
  if (!gathering) notFound();
  return <GatheringView gathering={gathering} me={me} />;
}
