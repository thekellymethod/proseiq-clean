import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSecret } from "@/lib/admin/guard";

export async function GET(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const pillarId = new URL(req.url).searchParams.get("pillar_id");
  const supabase = createAdminClient();
  let query = supabase
    .from("blog_articles")
    .select("*, blog_pillars(slug, title)")
    .order("sort_order", { ascending: true });

  if (pillarId) query = query.eq("pillar_id", pillarId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => ({}));
  const pillarId = body?.pillar_id;
  const slug = String(body?.slug ?? "").trim();
  const title = String(body?.title ?? "").trim();
  if (!pillarId || !slug || !title) {
    return NextResponse.json(
      { error: "pillar_id, slug, and title required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_articles")
    .insert({
      pillar_id: pillarId,
      slug,
      title,
      excerpt: body?.excerpt ?? null,
      content: body?.content ?? null,
      content_rich: body?.content_rich ?? null,
      media: Array.isArray(body?.media) ? body.media : [],
      published_at: body?.published_at ?? null,
      sort_order: Number(body?.sort_order) ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
