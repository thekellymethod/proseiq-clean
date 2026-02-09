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

const CASE_FIELDS = "id,title,status,case_type,priority,created_at,updated_at";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const { data, error } = await supabase.from("cases").select(CASE_FIELDS).eq("id", id).single();
  if (error) return bad(error.message, 400);
  if (!data) return bad("Not found", 404);

  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, any> = {};

  if (body?.title != null) patch.title = String(body.title).trim();
  if (body?.status != null) patch.status = String(body.status).trim();
  if (body?.case_type != null) patch.case_type = body.case_type ?? null;
  if (body?.priority != null) patch.priority = String(body.priority).trim();

  if (Object.keys(patch).length === 0) return bad("No fields to update", 400);

  const { data, error } = await supabase
    .from("cases")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(CASE_FIELDS)
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) return bad(error.message, 400);

  return NextResponse.json({ ok: true });
}
