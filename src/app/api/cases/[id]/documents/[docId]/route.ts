import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";

function mapDoc(row: any) {
  return {
    id: row.id,
    case_id: row.case_id,
    filename: row.filename,
    mime_type: row.mime_type ?? null,
    byte_size: row.size_bytes ?? null,
    storage_bucket: row.storage_bucket,
    storage_path: row.storage_path,
    kind: row.kind ?? null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const { data, error } = await supabase
    .from("documents")
    .select("id,case_id,filename,mime_type,size_bytes,storage_bucket,storage_path,kind,status,created_at,updated_at")
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) return badRequest(error.message);
  if (!data) return notFound("Document not found");
  return NextResponse.json({ item: mapDoc(data) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  for (const k of ["filename", "status", "kind"]) if (k in body) patch[k] = body[k];
  if ("filename" in patch) patch.filename = String(patch.filename ?? "").trim();

  if (Object.keys(patch).length === 0) return badRequest("No fields to update");

  const { data, error } = await supabase
    .from("documents")
    .update(patch)
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .select("id,case_id,filename,mime_type,size_bytes,storage_bucket,storage_path,kind,status,created_at,updated_at")
    .single();

  if (error) return badRequest(error.message);
  return NextResponse.json({ item: mapDoc(data) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const { data: doc, error: readErr } = await supabase
    .from("documents")
    .select("id,storage_bucket,storage_path")
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (readErr) return badRequest(readErr.message);
  if (!doc) return notFound("Document not found");

  if (doc.storage_bucket && doc.storage_path) {
    await supabase.storage.from(doc.storage_bucket).remove([doc.storage_path]);
  }

  const { error } = await supabase.from("documents").delete().eq("case_id", id).eq("id", docId);
  if (error) return badRequest(error.message);

  return NextResponse.json({ ok: true });
}
