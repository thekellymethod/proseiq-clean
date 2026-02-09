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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 200), 1), 1000);
  const status = String(url.searchParams.get("status") ?? "").trim();

  let query = supabase
    .from("case_tasks")
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .eq("case_id", id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return bad(error.message, 400);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return bad("title required", 400);

  const payload: any = {
    case_id: id,
    created_by: user.id,
    title,
    kind: String(body?.kind ?? "task").trim() || "task",
    status: String(body?.status ?? "open").trim() || "open",
    notes: body?.notes ?? null,
    due_at: body?.due_at ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("case_tasks")
    .insert(payload)
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const taskId = String(body?.task_id ?? body?.id ?? "").trim();
  const incoming = body?.patch && typeof body.patch === "object" ? body.patch : body;
  if (!taskId) return bad("task_id required", 400);

  const patch: any = {};
  for (const k of ["title", "kind", "status", "notes", "due_at"]) if (k in incoming) patch[k] = (incoming as any)[k];
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();
  patch.updated_at = new Date().toISOString();

  if (Object.keys(patch).length === 0) return bad("No fields to update", 400);

  const { data, error } = await supabase
    .from("case_tasks")
    .update(patch)
    .eq("case_id", id)
    .eq("id", taskId)
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .single();

  if (error) return bad(error.message, 400);
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const url = new URL(req.url);
  const taskId = String(url.searchParams.get("task_id") ?? "").trim();
  if (!taskId) return bad("task_id required", 400);

  const { error } = await supabase.from("case_tasks").delete().eq("case_id", id).eq("id", taskId);
  if (error) return bad(error.message, 400);

  return NextResponse.json({ ok: true });
}

