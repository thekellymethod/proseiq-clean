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
  if (!data?.signedUrl) return badRequest("Failed to create signed URL");

  // Stream the file with Content-Disposition: attachment for reliable download
  const fetchRes = await fetch(data.signedUrl);
  if (!fetchRes.ok) return badRequest("Failed to retrieve document");

  const contentType = doc.mime_type || "application/octet-stream";
  const filename = doc.filename || "document";
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

  return new NextResponse(fetchRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}

