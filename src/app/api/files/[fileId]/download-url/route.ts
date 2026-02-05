//src/app/api/files/[fileId]/download-url/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_: Request, { params }: { params: { fileId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: f, error: fErr } = await supabase
    .from("case_files")
    .select("id,bucket,path,filename")
    .eq("id", params.fileId)
    .single();

  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 400 });

  const signed = await supabase.storage.from(f.bucket).createSignedUrl(f.path, 120);
  if (signed.error) return NextResponse.json({ error: signed.error.message }, { status: 400 });

  await supabase.from("audit_log").insert({
    entity: "file",
    entity_id: f.id,
    action: "download",
    metadata: { filename: f.filename, path: f.path },
  });

  return NextResponse.json({ url: signed.data.signedUrl });
}
