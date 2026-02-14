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
  if (body?.kind != null) patch.kind = String(body.kind);
  if (body?.title !== undefined) patch.title = body.title ? String(body.title) : null;
  if (body?.content !== undefined) patch.content = body.content ? String(body.content) : null;
  if (body?.content_rich !== undefined) patch.content_rich = body.content_rich;
  if (Array.isArray(body?.media)) patch.media = body.media;
  if (typeof body?.sort_order === "number") patch.sort_order = body.sort_order;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("academy_module_content")
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
  const { error } = await supabase
    .from("academy_module_content")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
