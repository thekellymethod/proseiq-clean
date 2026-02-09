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

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id,storage_bucket,storage_path,filename")
    .eq("case_id", id)
    .eq("id", docId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!doc) return bad("Not found", 404);
  if (!doc.storage_bucket || !doc.storage_path) return bad("Document has no storage location", 400);

  const { data, error: signErr } = await supabase.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, expiresIn);
  if (signErr) return bad(signErr.message, 400);
  if (!data?.signedUrl) return bad("Failed to create signed URL", 400);

  // Hint to Storage to return as attachment (download)
  const signed = new URL(data.signedUrl);
  signed.searchParams.set("download", doc.filename || "document");

  return NextResponse.redirect(signed.toString());
}

