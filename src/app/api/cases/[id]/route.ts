import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";

const CASE_FIELDS = "id,title,status,created_at,updated_at";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data, error } = await supabase.from("cases").select(CASE_FIELDS).eq("id", id).single();
  if (error) return badRequest(error.message);
  if (!data) return notFound("Case not found");

  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, any> = {};

  if (body?.title != null) patch.title = String(body.title).trim();
  if (body?.status != null) patch.status = String(body.status).trim();

  if (Object.keys(patch).length === 0) return badRequest("No fields to update");

  const { data, error } = await supabase
    .from("cases")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(CASE_FIELDS)
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) return badRequest(error.message);

  return NextResponse.json({ ok: true });
}
