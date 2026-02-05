
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const filename = String(body?.filename ?? "").trim();
  const contentType = String(body?.content_type ?? "application/octet-stream").trim() || "application/octet-stream";

  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

  const bucket = "case-files";
  const uid = auth.user.id;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const objectPath = `user/${uid}/cases/${params.id}/${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    bucket,
    path: objectPath,
    signedUrl: data?.signedUrl,
    token: data?.token,
    contentType,
  });
}
