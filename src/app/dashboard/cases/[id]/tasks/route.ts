import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_tasks")
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .eq("case_id", params.id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, notes = null, due_at = null, kind = "task", status = "open" } = body ?? {};
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_tasks")
    .insert({
      case_id: params.id,
      title: String(title).trim(),
      notes,
      due_at,
      kind,
      status,
    })
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { task_id, patch } = body ?? {};
  if (!task_id) return NextResponse.json({ error: "task_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("case_tasks")
    .update(patch ?? {})
    .eq("id", task_id)
    .eq("case_id", params.id)
    .select("id,case_id,created_at,updated_at,due_at,kind,status,title,notes")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const taskId = url.searchParams.get("task_id");
  if (!taskId) return NextResponse.json({ error: "task_id required" }, { status: 400 });

  const { error } = await supabase
    .from("case_tasks")
    .delete()
    .eq("id", taskId)
    .eq("case_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}