import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/data";
import { deleteRecipe } from "@/app/actions";
import { RecipeForm } from "@/components/RecipeForm";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getRecipe(id);
  if (!found) notFound();
  const { recipe } = found;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display mb-5 text-3xl sm:text-4xl">Edit {recipe.title}</h1>
      <RecipeForm recipe={recipe} cancelHref={`/recipes/${recipe.id}`} />
      <div className="mt-10 mb-28 border-t border-line pt-6 text-center md:mb-0">
        <ConfirmButton
          action={deleteRecipe.bind(null, recipe.id)}
          message={`Delete ${recipe.title} and its photos from the Recipe Box? It can't be undone.`}
        >
          Delete this recipe
        </ConfirmButton>
      </div>
    </div>
  );
}
