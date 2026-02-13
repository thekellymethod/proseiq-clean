import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const url = new URL(req.url);
  const expiresIn = Math.min(Math.max(Number(url.searchParams.get("expiresIn") ?? 900), 60), 7 * 24 * 3600);

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id,storage_bucket,storage_path,filename,mime_type")
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) return badRequest(error.message);
  if (!doc) return notFound("Document not found");
  if (!doc.storage_bucket || !doc.storage_path) return badRequest("Document has no storage location");

  const { data, error: signErr } = await supabase.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, expiresIn);
  if (signErr) return badRequest(signErr.message);

  let downloadUrl: string | null = null;
  if (data?.signedUrl) {
    try {
      const u = new URL(data.signedUrl);
      // Supabase Storage supports `download` query param to force attachment.
      // If unsupported, this is still a harmless hint.
      u.searchParams.set("download", doc.filename || "document");
      downloadUrl = u.toString();
    } catch {
      downloadUrl = null;
    }
  }

  return NextResponse.json({ item: doc, signedUrl: data?.signedUrl, downloadUrl, expiresIn });
}
