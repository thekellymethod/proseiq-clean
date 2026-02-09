import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

export async function GET(_: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const { data, error } = await supabase
    .from("case_drafts")
    .select(
      "id,case_id,title,kind,status,content,content_rich,content_rich_updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title,created_at,updated_at"
    )
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle();

  if (error) return bad(error.message, 400);
  if (!data) return bad("Not found", 404);
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const body = await req.json().catch(() => ({}));
  const incoming = body?.patch && typeof body.patch === "object" ? body.patch : body;
  const patch: any = {};
  for (const k of [
    "title",
    "kind",
    "status",
    "content",
    "content_rich",
    "template_id",
    "signature_bucket",
    "signature_path",
    "signature_name",
    "signature_title",
  ])
    if (k in incoming) patch[k] = (incoming as any)[k];
  if ("title" in patch) patch.title = String(patch.title ?? "").trim();

  if (Object.keys(patch).length === 0) return bad("No fields to update", 400);

  // Keep updated_at current (table default does not auto-update).
  patch.updated_at = new Date().toISOString();
  if ("content_rich" in patch) {
    patch.content_rich_updated_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("case_drafts")
    .update(patch)
    .eq("case_id", id)
    .eq("id", draftId)
    .select(
      "id,case_id,title,kind,status,content,content_rich,content_rich_updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title,created_at,updated_at"
    )
    .single();

  if (error) return bad(error.message, 400);

  // Best-effort enqueue for proactive analysis (draft saved).
  try {
    await enqueueJob(supabase, user.id, {
      caseId: id,
      jobType: "draft_saved",
      sourceType: "case_drafts",
      sourceId: draftId,
      payload: { title: data.title, kind: data.kind, status: data.status },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { supabase, user, res } = await requireUser();
  if (!user) return res;

  const { id, draftId } = await params;
  const { error } = await supabase.from("case_drafts").delete().eq("case_id", id).eq("id", draftId);
  if (error) return bad(error.message, 400);
  return NextResponse.json({ ok: true });
}
