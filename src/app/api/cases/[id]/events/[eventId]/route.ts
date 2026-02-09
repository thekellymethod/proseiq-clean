import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: Request, context: { params: Promise<{ id: string; eventId: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId, eventId } = await context.params;

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, any> = {};

  if (body?.event_at) patch.event_at = body.event_at;
  if (body?.title) patch.title = body.title;
  if (body?.kind) patch.kind = body.kind;
  if (body?.notes !== undefined) patch.notes = body.notes;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_events")
    .update(patch)
    .eq("id", eventId)
    .eq("case_id", caseId)
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string; eventId: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId, eventId } = await context.params;

  const { error } = await supabase
    .from("case_events")
    .delete()
    .eq("id", eventId)
    .eq("case_id", caseId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
