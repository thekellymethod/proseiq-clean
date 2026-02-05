
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string; exhibitId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ex, error: exErr } = await supabase
    .from("case_exhibits")
    .select("id,case_id")
    .eq("id", params.exhibitId)
    .eq("case_id", params.id)
    .maybeSingle();

  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 400 });
  if (!ex) return NextResponse.json({ error: "Exhibit not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("case_exhibit_documents")
    .select("id,created_at,sort_order,note,document_id, case_documents:document_id(id,filename,content_type,bytes,storage_bucket,storage_path)")
    .eq("exhibit_id", params.exhibitId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string; exhibitId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const document_id = String(body?.document_id ?? "").trim();
  const note = body?.note ?? null;
  if (!document_id) return NextResponse.json({ error: "document_id required" }, { status: 400 });

  const { data: doc, error: docErr } = await supabase
    .from("case_documents")
    .select("id,case_id")
    .eq("id", document_id)
    .eq("case_id", params.id)
    .maybeSingle();

  if (docErr) return NextResponse.json({ error: docErr.message }, { status: 400 });
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("case_exhibit_documents")
    .insert({ exhibit_id: params.exhibitId, document_id, note })
    .select("id,created_at,sort_order,note,document_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string; exhibitId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const linkId = url.searchParams.get("link_id");
  if (!linkId) return NextResponse.json({ error: "link_id required" }, { status: 400 });

  const { error } = await supabase
    .from("case_exhibit_documents")
    .delete()
    .eq("id", linkId)
    .eq("exhibit_id", params.exhibitId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
