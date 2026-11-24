import Link from "next/link";
import { notFound } from "next/navigation";
import { getMembers, getRecipe } from "@/lib/data";
import { prettyDate, timeAgo, yearOf } from "@/lib/format";
import { courseEmoji, lines, RECIPE_TAGS } from "@/lib/types";
import { IngredientList, PrintButton } from "@/components/RecipeBits";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [found, members] = await Promise.all([getRecipe(id), getMembers()]);
  if (!found) notFound();
  const { recipe: r, history } = found;

  const ingredients = lines(r.ingredients);
  const steps = lines(r.steps);
  const hero = r.photos.find((p) => p.kind === "dish");
  const dishPhotos = r.photos.filter((p) => p.kind === "dish" && p !== hero);
  const cards = r.photos.filter((p) => p.kind === "card");
  const nameOf = (memberId: string | null) => members.find((m) => m.id === memberId)?.name;
  const writtenOut = ingredients.length > 0 || steps.length > 0;

  return (
    <article className="mx-auto max-w-4xl space-y-6 pb-8">
      <Link href="/recipes" className="no-print text-sm font-bold text-ink-soft hover:text-ink">
        ← The Recipe Box
      </Link>

      <header className="card overflow-hidden">
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.url} alt={r.title} className="max-h-72 w-full object-cover sm:max-h-[420px]" />
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">{r.title}</h1>
              {r.from_whom && <p className="mt-1 text-lg text-ink-soft">from {r.from_whom}</p>}
            </div>
            <div className="no-print flex gap-2">
              <PrintButton />
              <Link href={`/recipes/${r.id}/edit`} className="btn btn-ghost btn-sm">
                ✏️ Edit
              </Link>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
            {r.course && (
              <span className="rounded-full bg-marigold-soft px-3 py-1 text-marigold-ink">
                {courseEmoji(r.course)} {r.course}
              </span>
            )}
            {RECIPE_TAGS.filter((t) => r.tags.includes(t.id)).map((t) => (
              <span key={t.id} className="rounded-full bg-pod px-3 py-1 text-pod-ink">
                {t.emoji} {t.label}
              </span>
            ))}
            {r.servings && <span className="rounded-full bg-moss-soft px-3 py-1 text-moss-ink">🍽️ {r.servings}</span>}
            {r.time_note && <span className="rounded-full bg-moss-soft px-3 py-1 text-moss-ink">⏱️ {r.time_note}</span>}
          </div>
          {r.story && (
            <blockquote className="font-display mt-5 border-l-4 border-marigold/50 pl-4 text-lg whitespace-pre-line text-ink italic">
              {r.story}
            </blockquote>
          )}
        </div>
      </header>

      {writtenOut ? (
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {ingredients.length > 0 && (
            <section className="card p-6">
              <h2 className="section-title mb-3">Ingredients</h2>
              <IngredientList items={ingredients} />
            </section>
          )}
          {steps.length > 0 && (
            <section className={`card p-6 ${ingredients.length ? "" : "md:col-span-2"}`}>
              <h2 className="section-title mb-3">Steps</h2>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-plum text-sm font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      ) : (
        cards.length > 0 && (
          <p className="no-print rounded-2xl bg-pod px-5 py-4 text-[15px]">
            📇 This recipe lives on the card below.{" "}
            <Link href={`/recipes/${r.id}/edit`} className="font-bold text-plum underline-offset-2 hover:underline">
              Type it out
            </Link>{" "}
            so it&apos;s searchable and easy to read on a phone.
          </p>
        )
      )}

      {cards.length > 0 && (
        <section className="card p-6">
          <h2 className="section-title mb-1">The original card</h2>
          <p className="no-print mb-4 text-sm text-ink-soft">Tap to see it full size.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Recipe card for ${r.title}`} className="w-full" loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      )}

      {dishPhotos.length > 0 && (
        <section className="no-print">
          <h2 className="section-title mb-3">More photos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dishPhotos.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-2xl border border-line bg-pod">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="card no-print p-6">
        <h2 className="section-title mb-1">On the table</h2>
        {history.length === 0 ? (
          <p className="text-ink-soft">
            Not linked to a gathering yet. On the menu, tap <span className="font-bold">📖 Recipe</span> on a dish to link it here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {history.map((h) => (
              <li key={h.dish_id}>
                <Link href={`/g/${h.gathering_id}`} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 hover:text-plum">
                  <span className="font-bold">
                    {yearOf(h.date) && <span className="mr-2 text-marigold">{yearOf(h.date)}</span>}
                    {h.gathering_title}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {h.made_by ? `made by ${h.made_by}` : prettyDate(h.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="no-print text-center text-sm text-ink-soft">
        {nameOf(r.created_by) ? `Saved by ${nameOf(r.created_by)}` : "Saved"} {timeAgo(r.created_at)}
        {r.updated_at !== r.created_at && nameOf(r.updated_by) && ` · last edited by ${nameOf(r.updated_by)} ${timeAgo(r.updated_at)}`}
      </p>
    </article>
  );
}
