
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const docId = String(body?.doc_id ?? "").trim();
  if (!docId) return NextResponse.json({ error: "doc_id required" }, { status: 400 });

  const { data: doc, error: getErr } = await supabase
    .from("case_documents")
    .select("id,storage_bucket,storage_path")
    .eq("id", docId)
    .eq("case_id", params.id)
    .single();

  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 400 });

  const { data, error } = await supabase.storage.from(doc.storage_bucket).createSignedUrl(doc.storage_path, 60 * 10);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ url: data?.signedUrl });
}
