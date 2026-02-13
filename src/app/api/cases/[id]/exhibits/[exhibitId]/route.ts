import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function PATCH(req: Request, props: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { id, exhibitId } = await props.params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json();
  const patch: any = {};
  if (body.title != null) patch.title = String(body.title);
  if (body.description !== undefined) patch.description = body.description == null ? null : String(body.description);
  if (body.file_id !== undefined) patch.file_id = body.file_id ? String(body.file_id) : null;
  if (body.sort != null) patch.sort = Number(body.sort);

  const { data, error } = await supabase
    .from("case_exhibits")
    .update(patch)
    .eq("case_id", id)
    .eq("id", exhibitId)
    .select("id,case_id,file_id,code,title,description,sort,created_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, props: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { id, exhibitId } = await props.params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { error } = await supabase.from("case_exhibits").delete().eq("case_id", id).eq("id", exhibitId);
  if (error) return badRequest(error.message);
  return NextResponse.json({ ok: true });
}
