import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { draftId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_draft_versions")
    .select("id,draft_id,created_at")
    .eq("draft_id", params.draftId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { draftId: string } }) {
  // restore a version -> updates draft.content
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const versionId = String(body.versionId ?? "").trim();
  if (!versionId) return NextResponse.json({ error: "versionId required" }, { status: 400 });

  const { data: v, error: vErr } = await supabase
    .from("case_draft_versions")
    .select("id,content")
    .eq("id", versionId)
    .eq("draft_id", params.draftId)
    .single();

  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 400 });

  const { data, error } = await supabase
    .from("case_drafts")
    .update({ content: v.content })
    .eq("id", params.draftId)
    .select("id,case_id,title,kind,content,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
