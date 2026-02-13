import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));

  const filenameRaw = String(body?.filename ?? "").trim();
  const mimeType = String(body?.mime_type ?? body?.mimeType ?? "").trim() || "image/png";
  if (!filenameRaw) return badRequest("filename required");

  const { data: draft, error: dErr } = await supabase
    .from("case_drafts")
    .select("id")
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle();
  if (dErr) return badRequest(dErr.message);
  if (!draft) return notFound("Draft not found");

  const bucket = String(body?.bucket ?? "case-signatures");
  const filename = safeName(filenameRaw);
  const objectPath = `${user.id}/${id}/signatures/${draftId}/${crypto.randomUUID()}-${filename}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) return badRequest(error.message);

  return NextResponse.json({
    upload: {
      bucket,
      path: objectPath,
      signedUrl: data?.signedUrl,
      token: data?.token,
      headers: { "Content-Type": mimeType },
    },
  });
}

