import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSecret } from "@/lib/admin/guard";

export async function GET(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_pillars")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => ({}));
  const slug = String(body?.slug ?? "").trim();
  const title = String(body?.title ?? "").trim();
  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_pillars")
    .insert({
      slug,
      title,
      tagline: body?.tagline ?? null,
      topics: Array.isArray(body?.topics) ? body.topics : [],
      sort_order: Number(body?.sort_order) ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
