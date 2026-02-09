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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const filenameRaw = String(body?.filename ?? "").trim();
  const mimeType = String(body?.mime_type ?? body?.mimeType ?? "").trim() || "application/octet-stream";
  const byteSize = body?.byte_size ?? body?.byteSize ?? null;

  if (!filenameRaw) return bad("filename required", 400);

  const bucket = String(body?.bucket ?? "case-documents");
  const filename = safeName(filenameRaw);
  const objectPath = `${user.id}/${id}/${crypto.randomUUID()}-${filename}`;

  const { data: row, error: rowErr } = await supabase
    .from("documents")
    .insert({
      case_id: id,
      created_by: user.id,
      filename,
      mime_type: mimeType,
      size_bytes: byteSize,
      storage_bucket: bucket,
      storage_path: objectPath,
      kind: body?.kind ?? "general",
      status: "active",
    })
    .select("id,case_id,filename,mime_type,size_bytes,storage_bucket,storage_path,kind,status,created_at,updated_at")
    .single();

  if (rowErr) return bad(rowErr.message, 400);

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) return bad(error.message, 400);

  return NextResponse.json({
    item: {
      id: row.id,
      case_id: row.case_id,
      filename: row.filename,
      mime_type: row.mime_type ?? null,
      byte_size: row.size_bytes ?? null,
      storage_bucket: row.storage_bucket,
      storage_path: row.storage_path,
      kind: row.kind ?? null,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    upload: {
      bucket,
      path: objectPath,
      signedUrl: data?.signedUrl,
      token: data?.token,
      headers: { "Content-Type": mimeType },
    },
  });
}
