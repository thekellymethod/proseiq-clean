import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await context.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "200") || 200, 500);

  const { data, error } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .eq("case_id", caseId)
    .order("event_at", { ascending: true })
    .limit(limit);

  if (error) return badRequest(error.message);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await context.params;
  const result = await requireCaseAccess(caseId);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const { event_at, title, kind = "note", notes = null } = body ?? {};

  if (!event_at || !title) {
    return badRequest("event_at and title required");
  }

  const { data, error } = await supabase
    .from("case_events")
    .insert({
      case_id: caseId,
      event_at,
      title,
      kind,
      notes,
    })
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .single();

  if (error) return badRequest(error.message);

  // Best-effort enqueue for proactive analysis (Pro only).
  const plan = await getPlanForUser();
  if (plan === "pro") {
    try {
      await enqueueJob(supabase, user.id, {
        caseId,
        jobType: "event_created",
        sourceType: "case_events",
        sourceId: data.id,
        payload: { event: data },
      });
    } catch {
      // ignore enqueue failures; core CRUD must succeed
    }
  }

  return NextResponse.json({ item: data });
}
