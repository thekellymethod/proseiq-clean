import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPlanForUser } from "@/lib/billing/plan";

async function enqueueJob(supabase: any, userId: string, opts: { caseId: string; jobType: string; sourceType?: string; sourceId?: string; payload?: any }) {
  await supabase.from("case_ai_jobs").insert({
    case_id: opts.caseId,
    created_by: userId,
    job_type: opts.jobType,
    source_type: opts.sourceType ?? null,
    source_id: opts.sourceId ?? null,
    payload: opts.payload ?? {},
    status: "queued",
  });
}

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

  // Verify case ownership
  const { data: c } = await supabase.from("cases").select("id").eq("id", id).eq("created_by", user.id).maybeSingle();
  if (!c) return bad("Not found", 404);

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

  // Best-effort enqueue for proactive analysis (document added, Pro only).
  const plan = await getPlanForUser();
  if (plan === "pro") {
    try {
      await enqueueJob(supabase, user.id, {
        caseId: id,
        jobType: "document_added",
        sourceType: "documents",
        sourceId: row.id,
        payload: { filename: row.filename, mime_type: row.mime_type, kind: row.kind },
      });
    } catch {
      // ignore
    }
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
  if (error) {
    // Roll back the DB row if we couldn't create an upload URL.
    try {
      await supabase.from("documents").delete().eq("id", row.id).eq("case_id", id);
    } catch {
      // ignore
    }
    return bad(error.message, 400);
  }

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
