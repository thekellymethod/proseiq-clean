import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound, conflict } from "@/lib/api/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; bundleId: string }> }) {
  const { id, bundleId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data: bundle, error } = await supabase
    .from("case_bundles")
    .select("id,status,storage_bucket,storage_path,output_path,title")
    .eq("case_id", id)
    .eq("id", bundleId)
    .maybeSingle();

  if (error) return badRequest(error.message);
  if (!bundle) return notFound("Bundle not found");

  const bucket = bundle.storage_bucket || "case-files";
  const path = bundle.storage_path || bundle.output_path;

  if (bundle.status !== "ready" || !path) {
    return conflict("Bundle not ready. Process it first.");
  }

  const { data: blob, error: dlErr } = await supabase.storage.from(bucket).download(path);
  if (dlErr) return badRequest(dlErr.message);
  if (!blob) return notFound("Bundle not found");

  const bytes = Buffer.from(await blob.arrayBuffer());
  const filename = `${bundle.title || bundle.id}.zip`.replace(/[^a-zA-Z0-9._-]+/g, "_");

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Content-Length": String(bytes.length),
    },
  });
}
