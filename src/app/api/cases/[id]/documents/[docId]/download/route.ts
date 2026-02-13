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

export async function GET(req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, docId } = await params;
  const url = new URL(req.url);
  const expiresIn = Math.min(Math.max(Number(url.searchParams.get("expiresIn") ?? 900), 60), 7 * 24 * 3600);

  // Verify case ownership and fetch document
  const { data: c } = await supabase.from("cases").select("id").eq("id", id).eq("created_by", user.id).maybeSingle();
  if (!c) return bad("Not found", 404);

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id,storage_bucket,storage_path,filename,mime_type")
    .eq("case_id", id)
    .eq("id", docId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!doc) return bad("Not found", 404);
  if (!doc.storage_bucket || !doc.storage_path) return bad("Document has no storage location", 400);

  const { data, error: signErr } = await supabase.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, expiresIn);
  if (signErr) return bad(signErr.message, 400);
  if (!data?.signedUrl) return bad("Failed to create signed URL", 400);

  // Stream the file with Content-Disposition: attachment for reliable download
  const fetchRes = await fetch(data.signedUrl);
  if (!fetchRes.ok) return bad("Failed to retrieve document", 502);

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

