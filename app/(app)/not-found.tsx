import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto mt-10 max-w-md px-6 py-10 text-center">
      <div className="text-5xl">🍽️</div>
      <h1 className="font-display mt-3 text-2xl">That seat&apos;s empty</h1>
      <p className="mt-1 text-ink-soft">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to the table
      </Link>
    </div>
  );
}
