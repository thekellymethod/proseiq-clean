import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSecret } from "@/lib/admin/guard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (body?.slug != null) patch.slug = String(body.slug).trim();
  if (body?.title != null) patch.title = String(body.title).trim();
  if (body?.excerpt !== undefined) patch.excerpt = body.excerpt ? String(body.excerpt) : null;
  if (body?.content !== undefined) patch.content = body.content ? String(body.content) : null;
  if (body?.content_rich !== undefined) patch.content_rich = body.content_rich;
  if (Array.isArray(body?.media)) patch.media = body.media;
  if (body?.published_at !== undefined) patch.published_at = body.published_at ? String(body.published_at) : null;
  if (typeof body?.sort_order === "number") patch.sort_order = body.sort_order;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blog_articles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminSecret(_req);
  if (!guard.ok) return guard.res;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("blog_articles").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
