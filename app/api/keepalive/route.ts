import { db } from "@/lib/supabase";

// Free Supabase projects pause after a week without activity. A daily Vercel
// cron hits this route so the table is ready whenever the family needs it.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { count, error } = await db().from("lt_gatherings").select("id", { count: "exact", head: true });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, gatherings: count });
}
