import { GatheringForm } from "@/components/GatheringForm";
import { nextThanksgiving, yearOf } from "@/lib/format";

export default function NewGatheringPage() {
  const date = nextThanksgiving();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display mb-5 text-3xl sm:text-4xl">Set a new table</h1>
      <GatheringForm defaults={{ title: `Thanksgiving ${yearOf(date)}`, date }} />
    </div>
  );
}
