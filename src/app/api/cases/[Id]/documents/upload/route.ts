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

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const body = await req.json().catch(() => ({}));
  const filenameRaw = String(body?.filename ?? "").trim();
  const mimeType = String(body?.mime_type ?? body?.mimeType ?? "").trim() || "application/octet-stream";
  const byteSize = body?.byte_size ?? body?.byteSize ?? null;

  if (!filenameRaw) return bad("filename required", 400);

  const bucket = String(body?.bucket ?? "case-files");
  const filename = safeName(filenameRaw);
  const objectPath = `${user.id}/${params.id}/${crypto.randomUUID()}-${filename}`;

  const { data: row, error: rowErr } = await supabase
    .from("case_documents")
    .insert({
      case_id: params.id,
      filename,
      mime_type: mimeType,
      byte_size: byteSize,
      storage_bucket: bucket,
      storage_path: objectPath,
      status: "uploading",
    })
    .select("id,case_id,filename,mime_type,byte_size,storage_bucket,storage_path,status,created_at")
    .single();

  if (rowErr) return bad(rowErr.message, 400);

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) return bad(error.message, 400);

  return NextResponse.json({
    item: row,
    upload: {
      bucket,
      path: objectPath,
      signedUrl: data?.signedUrl,
      token: data?.token,
      headers: { "Content-Type": mimeType },
    },
  });
}
