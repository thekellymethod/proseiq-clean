import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function PATCH(req: Request, context: { params: Promise<{ id: string; eventId: string }> }) {
  const { id: caseId, eventId } = await context.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, any> = {};

  if (body?.event_at) patch.event_at = body.event_at;
  if (body?.title) patch.title = body.title;
  if (body?.kind) patch.kind = body.kind;
  if (body?.notes !== undefined) patch.notes = body.notes;

  if (Object.keys(patch).length === 0) {
    return badRequest("No fields to update");
  }

  const { data, error } = await supabase
    .from("case_events")
    .update(patch)
    .eq("id", eventId)
    .eq("case_id", caseId)
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string; eventId: string }> }) {
  const { id: caseId, eventId } = await context.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { error } = await supabase
    .from("case_events")
    .delete()
    .eq("id", eventId)
    .eq("case_id", caseId);

  if (error) return badRequest(error.message);
  return NextResponse.json({ ok: true });
}
