//src/app/api/files/[fileId]/upload-url/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request, { params }: { params: { fileId: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: f, error: fErr } = await supabase
    .from("case_files")
    .select("id,bucket,path")
    .eq("id", params.fileId)
    .single();

  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 400 });

  // Supabase Storage signed upload URL
  const body = await req.json().catch(() => ({}));
  const contentType = body.contentType ? String(body.contentType) : undefined;

  // createSignedUploadUrl exists in newer storage APIs; if yours lacks it, you’ll use direct upload with session token.
  const { data, error } = await supabase.storage.from(f.bucket).createSignedUploadUrl(f.path);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ url: data.signedUrl, path: f.path, contentType });
}
