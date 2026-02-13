import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";

export async function GET(_: Request, { params }: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { id, exhibitId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;

  const { data: ex } = await supabase
    .from("case_exhibits")
    .select("id")
    .eq("case_id", id)
    .eq("id", exhibitId)
    .maybeSingle();
  if (!ex) return notFound("Exhibit not found");

  const { data: rows, error } = await supabase
    .from("case_exhibit_documents")
    .select("document_id")
    .eq("exhibit_id", exhibitId);
  if (error) return badRequest(error.message);

  const docIds = (rows ?? []).map((r) => r.document_id);
  if (docIds.length === 0) return NextResponse.json({ items: [] });

  const { data: docs, error: docErr } = await supabase
    .from("documents")
    .select("id,filename,storage_bucket,storage_path,status")
    .eq("case_id", id)
    .in("id", docIds);
  if (docErr) return badRequest(docErr.message);

  return NextResponse.json({ items: docs ?? [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { id, exhibitId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const docId = String(body?.docId ?? body?.document_id ?? "").trim();
  if (!docId) return badRequest("docId required");

  const { data: ex, error: exErr } = await supabase
    .from("case_exhibits")
    .select("id")
    .eq("case_id", id)
    .eq("id", exhibitId)
    .maybeSingle();
  if (exErr) return badRequest(exErr.message);
  if (!ex) return notFound("Exhibit not found");

  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("id")
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .maybeSingle();
  if (docErr) return badRequest(docErr.message);
  if (!doc) return notFound("Document not found");

  const { error } = await supabase
    .from("case_exhibit_documents")
    .insert({ exhibit_id: exhibitId, document_id: docId });

  if (error && !/duplicate/i.test(error.message)) return badRequest(error.message);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; exhibitId: string }> }) {
  const { id, exhibitId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const docId = url.searchParams.get("docId") ?? url.searchParams.get("document_id");
  if (!docId) return badRequest("docId required");

  const { error } = await supabase
    .from("case_exhibit_documents")
    .delete()
    .eq("exhibit_id", exhibitId)
    .eq("document_id", docId);

  if (error) return badRequest(error.message);
  return NextResponse.json({ ok: true });
}
