import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { draftId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_drafts")
    .select("id,case_id,title,kind,content,created_at,updated_at")
    .eq("id", params.draftId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: { draftId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const patch: any = {};
  if (body.title != null) patch.title = String(body.title);
  if (body.kind != null) patch.kind = String(body.kind);
  if (body.content != null) patch.content = String(body.content);

  const { data, error } = await supabase
    .from("case_drafts")
    .update(patch)
    .eq("id", params.draftId)
    .select("id,case_id,title,kind,content,created_at,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function POST(req: Request, { params }: { params: { draftId: string } }) {
  // POST = snapshot version
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: draft, error: dErr } = await supabase
    .from("case_drafts")
    .select("id,content")
    .eq("id", params.draftId)
    .single();

  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 400 });

  const { data, error } = await supabase
    .from("case_draft_versions")
    .insert({ draft_id: draft.id, content: draft.content })
    .select("id,draft_id,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: { draftId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("case_drafts").delete().eq("id", params.draftId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
