import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { data, error } = await supabase
    .from("case_drafts")
    .select(
      "id,case_id,title,kind,status,content,content_rich,content_rich_updated_at,template_id,signature_bucket,signature_path,signature_name,signature_title,created_at,updated_at"
    )
    .eq("case_id", id)
    .eq("id", draftId)
    .maybeSingle();

  if (error) return badRequest(error.message);
  if (!data) return notFound("Draft not found");
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
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

  if (Object.keys(patch).length === 0) return badRequest("No fields to update");

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

  if (error) return badRequest(error.message);

  // Best-effort enqueue for proactive analysis (draft saved, Pro only).
  const plan = await getPlanForUser();
  if (plan === "pro") {
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
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const { error } = await supabase.from("case_drafts").delete().eq("case_id", id).eq("id", draftId);
  if (error) return badRequest(error.message);
  return NextResponse.json({ ok: true });
}
