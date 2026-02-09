import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { supabase, user: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user: auth.user, res: null as any };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, bundleId } = await params;
  const { data, error } = await supabase
    .from("case_bundles")
    .select("id,case_id,title,status,manifest,storage_bucket,storage_path,created_at,updated_at")
    .eq("case_id", id)
    .eq("id", bundleId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!data) return bad("Not found", 404);
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, bundleId } = await params;
  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  for (const k of ["title", "status", "manifest", "storage_bucket", "storage_path"]) if (k in body) patch[k] = body[k];
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();

  if (Object.keys(patch).length === 0) return bad("No fields to update", 400);

  const { data, error } = await supabase
    .from("case_bundles")
    .update(patch)
    .eq("case_id", id)
    .eq("id", bundleId)
    .select("id,case_id,title,status,manifest,storage_bucket,storage_path,created_at,updated_at")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, bundleId } = await params;
  const { data: bundle } = await supabase
    .from("case_bundles")
    .select("storage_bucket,storage_path")
    .eq("case_id", id)
    .eq("id", bundleId)
    .maybeSingle();

  if (bundle?.storage_bucket && bundle?.storage_path) {
    await supabase.storage.from(bundle.storage_bucket).remove([bundle.storage_path]);
  }

  const { error } = await supabase.from("case_bundles").delete().eq("case_id", id).eq("id", bundleId);
  if (error) return bad(error.message, 400);

  return NextResponse.json({ ok: true });
}
