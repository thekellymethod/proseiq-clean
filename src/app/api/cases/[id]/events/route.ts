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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await context.params;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "200") || 200, 500);

  const { data, error } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,kind,title,notes,created_at")
    .eq("case_id", caseId)
    .order("event_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: caseId } = await context.params;

  const body = await req.json().catch(() => ({}));
  const { event_at, title, kind = "note", notes = null } = body ?? {};

  if (!event_at || !title) {
    return NextResponse.json({ error: "event_at and title required" }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Best-effort enqueue for proactive analysis.
  try {
    await enqueueJob(supabase, auth.user.id, {
      caseId,
      jobType: "event_created",
      sourceType: "case_events",
      sourceId: data.id,
      payload: { event: data },
    });
  } catch {
    // ignore enqueue failures; core CRUD must succeed
  }

  return NextResponse.json({ item: data });
}
