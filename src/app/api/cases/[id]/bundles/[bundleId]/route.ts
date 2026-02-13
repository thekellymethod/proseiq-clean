import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";

export async function GET(_: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { id, bundleId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data, error } = await supabase
    .from("case_bundles")
    .select("id,case_id,title,status,kind,include_bates,bates_prefix,bates_start,manifest,output_path,error,created_at,updated_at")
    .eq("case_id", id)
    .eq("id", bundleId)
    .maybeSingle();

  if (error) return badRequest(error.message);
  if (!data) return notFound("Bundle not found");
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { id, bundleId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  for (const k of ["title", "status", "kind", "include_bates", "bates_prefix", "bates_start", "manifest", "output_path", "error"]) {
    if (k in body) patch[k] = (body as any)[k];
  }
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();

  if (Object.keys(patch).length === 0) return badRequest("No fields to update");

  const { data, error } = await supabase
    .from("case_bundles")
    .update(patch)
    .eq("case_id", id)
    .eq("id", bundleId)
    .select("id,case_id,title,status,kind,include_bates,bates_prefix,bates_start,manifest,output_path,error,created_at,updated_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { id, bundleId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { error } = await supabase.from("case_bundles").delete().eq("case_id", id).eq("id", bundleId);
  if (error) return badRequest(error.message);

  return NextResponse.json({ ok: true });
}
