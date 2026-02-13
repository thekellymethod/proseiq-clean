import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
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
  if (error) return badRequest(error.message);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  if (!title) return badRequest("title required");

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

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const body = await req.json().catch(() => ({}));
  const taskId = String(body?.task_id ?? body?.id ?? "").trim();
  const incoming = body?.patch && typeof body.patch === "object" ? body.patch : body;
  if (!taskId) return badRequest("task_id required");

  const patch: any = {};
  for (const k of ["title", "kind", "status", "notes", "due_at"]) if (k in incoming) patch[k] = (incoming as any)[k];
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();
  patch.updated_at = new Date().toISOString();

  if (Object.keys(patch).length === 0) return badRequest("No fields to update");

  const { data, error } = await supabase
    .from("case_tasks")
    .update(patch)
    .eq("case_id", id)
    .eq("id", taskId)
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const taskId = String(url.searchParams.get("task_id") ?? "").trim();
  if (!taskId) return badRequest("task_id required");

  const { error } = await supabase.from("case_tasks").delete().eq("case_id", id).eq("id", taskId);
  if (error) return badRequest(error.message);

  return NextResponse.json({ ok: true });
}

