import { getDish, listRecipeTitles } from "@/lib/data";
import { RecipeForm } from "@/components/RecipeForm";
import { LinkRecipe } from "@/components/LinkRecipe";

export default async function NewRecipePage({ searchParams }: { searchParams: Promise<{ dish?: string }> }) {
  const { dish: dishId } = await searchParams;
  const dish = dishId ? await getDish(dishId) : null;
  const existing = dish ? await listRecipeTitles() : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">{dish ? `Recipe for the ${dish.name}` : "Add a recipe"}</h1>
        {dish && <p className="text-ink-soft">It&apos;ll be linked to the {dish.name} on {dish.gathering_title}.</p>}
      </div>
      {dish && existing.length > 0 && <LinkRecipe dishId={dish.id} dishName={dish.name} recipes={existing} />}
      <RecipeForm
        dishId={dish?.id}
        defaults={dish ? { title: dish.name, from_whom: dish.bringer, course: dish.course } : undefined}
        cancelHref={dish ? `/g/${dish.gathering_id}#menu` : "/recipes"}
      />
    </div>
  );
}
