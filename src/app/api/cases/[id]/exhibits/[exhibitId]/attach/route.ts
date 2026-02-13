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

export async function GET(_: Request, { params }: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, exhibitId } = await params;

  const { data: ex } = await supabase
    .from("case_exhibits")
    .select("id")
    .eq("case_id", id)
    .eq("id", exhibitId)
    .maybeSingle();
  if (!ex) return bad("Exhibit not found", 404);

  const { data: rows, error } = await supabase
    .from("case_exhibit_documents")
    .select("document_id")
    .eq("exhibit_id", exhibitId);
  if (error) return bad(error.message, 400);

  const docIds = (rows ?? []).map((r) => r.document_id);
  if (docIds.length === 0) return NextResponse.json({ items: [] });

  const { data: docs, error: docErr } = await supabase
    .from("documents")
    .select("id,filename,storage_bucket,storage_path,status")
    .eq("case_id", id)
    .in("id", docIds);
  if (docErr) return bad(docErr.message, 400);

  return NextResponse.json({ items: docs ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, exhibitId } = await params;
  const body = await req.json().catch(() => ({}));
  const docId = String(body?.docId ?? body?.document_id ?? "").trim();
  if (!docId) return bad("docId required", 400);

  const { data: ex, error: exErr } = await supabase
    .from("case_exhibits")
    .select("id")
    .eq("case_id", id)
    .eq("id", exhibitId)
    .maybeSingle();
  if (exErr) return bad(exErr.message, 400);
  if (!ex) return bad("Exhibit not found", 404);

  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("id")
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .maybeSingle();
  if (docErr) return bad(docErr.message, 400);
  if (!doc) return bad("Document not found", 404);

  const { error } = await supabase
    .from("case_exhibit_documents")
    .insert({ exhibit_id: exhibitId, document_id: docId });

  if (error && !/duplicate/i.test(error.message)) return bad(error.message, 400);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { exhibitId } = await params;
  const url = new URL(req.url);
  const docId = url.searchParams.get("docId") ?? url.searchParams.get("document_id");
  if (!docId) return bad("docId required", 400);

  const { error } = await supabase
    .from("case_exhibit_documents")
    .delete()
    .eq("exhibit_id", exhibitId)
    .eq("document_id", docId);

  if (error) return bad(error.message, 400);
  return NextResponse.json({ ok: true });
}
