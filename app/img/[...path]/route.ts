import { db, PHOTO_BUCKET } from "@/lib/supabase";

// Streams a photo from the private bucket. Paths are random UUIDs that never
// change, so the browser may cache them forever.
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const key = path.join("/");
  if (!/^(full|thumb)\/[0-9a-f-]{36}\.(jpg|webp)$/.test(key)) {
    return new Response("Not found", { status: 404 });
  }
  const { data, error } = await db().storage.from(PHOTO_BUCKET).download(key);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
