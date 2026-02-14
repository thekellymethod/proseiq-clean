import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSecret } from "@/lib/admin/guard";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = requireAdminSecret(req);
  if (!guard.ok) return guard.res;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academy_tiers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item: data });
}

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
  if (body?.tagline !== undefined) patch.tagline = body.tagline ? String(body.tagline) : null;
  if (body?.pricing !== undefined) patch.pricing = body.pricing ? String(body.pricing) : null;
  if (Array.isArray(body?.includes)) patch.includes = body.includes;
  if (typeof body?.sort_order === "number") patch.sort_order = body.sort_order;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academy_tiers")
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
  const { error } = await supabase.from("academy_tiers").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
