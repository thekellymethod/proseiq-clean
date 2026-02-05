
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("case_documents")
    .select("id,case_id,created_at,updated_at,filename,content_type,bytes,storage_bucket,storage_path,notes,tags")
    .eq("case_id", params.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const filename = String(body?.filename ?? "").trim();
  const storage_path = String(body?.storage_path ?? "").trim();
  const storage_bucket = String(body?.storage_bucket ?? "case-files").trim() || "case-files";

  if (!filename || !storage_path) {
    return NextResponse.json({ error: "filename and storage_path required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_documents")
    .insert({
      case_id: params.id,
      filename,
      content_type: body?.content_type ?? null,
      bytes: body?.bytes ?? null,
      storage_bucket,
      storage_path,
      notes: body?.notes ?? null,
      tags: Array.isArray(body?.tags) ? body.tags : [],
    })
    .select("id,case_id,created_at,updated_at,filename,content_type,bytes,storage_bucket,storage_path,notes,tags")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const docId = url.searchParams.get("doc_id");
  if (!docId) return NextResponse.json({ error: "doc_id required" }, { status: 400 });

  const { data: doc, error: getErr } = await supabase
    .from("case_documents")
    .select("id,storage_bucket,storage_path")
    .eq("id", docId)
    .eq("case_id", params.id)
    .maybeSingle();

  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 400 });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: storageErr } = await supabase.storage.from(doc.storage_bucket).remove([doc.storage_path]);
  if (storageErr) return NextResponse.json({ error: storageErr.message }, { status: 400 });

  const { error } = await supabase.from("case_documents").delete().eq("id", docId).eq("case_id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
