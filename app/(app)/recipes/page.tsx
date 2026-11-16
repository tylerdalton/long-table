import Link from "next/link";
import { listRecipes } from "@/lib/data";
import { RecipeList } from "@/components/RecipeList";

export default async function RecipesPage() {
  const recipes = await listRecipes();
  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">The Recipe Box 📖</h1>
          <p className="text-ink-soft">Grandma&apos;s secret sauce, Rope&apos;s turkey, and everything worth making again.</p>
        </div>
        <Link href="/recipes/new" className="btn btn-primary">
          ＋ Add a recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="card mx-auto max-w-xl px-6 py-12 text-center">
          <div className="text-6xl">📇</div>
          <h2 className="font-display mt-3 text-2xl">The box is empty, for now</h2>
          <p className="mx-auto mt-2 max-w-sm text-ink-soft">
            The quickest start is a photo of a handwritten recipe card. You can type it out later.
          </p>
          <Link href="/recipes/new" className="btn btn-primary mt-6">
            Add the first recipe
          </Link>
        </div>
      ) : (
        <RecipeList recipes={recipes} />
      )}
    </div>
  );
}
