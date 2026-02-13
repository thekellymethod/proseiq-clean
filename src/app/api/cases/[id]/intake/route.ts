import { NextResponse } from "next/server";
import { requireCaseAccess, guardAuth } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { getPlanForUser } from "@/lib/billing/plan";

async function enqueueJob(
  supabase: any,
  userId: string,
  opts: { caseId: string; jobType: string; sourceType?: string; sourceId?: string | null; payload?: any }
) {
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

async function getIntake(supabase: any, caseId: string) {
  const { data, error } = await supabase
    .from("case_intakes")
    .select("case_id,intake,updated_at,created_at")
    .eq("case_id", caseId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase } = result;
  try {
    const item = await getIntake(supabase, id);
    return NextResponse.json({ item: item?.intake ?? {} });
  } catch (e: any) {
    return NextResponse.json({ item: {}, warning: e?.message ?? "intake not ready" });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireCaseAccess(id);
  if (guardAuth(result)) return result.res;

  const { supabase, user } = result;
  const body = await req.json().catch(() => ({}));
  const patch = body?.patch ?? null;
  if (!patch || typeof patch !== "object") return badRequest("patch object required");

  try {
    const current = await getIntake(supabase, id);
    const currentIntake = current?.intake ?? {};
    const nextIntake = { ...currentIntake, ...patch };

    const { data, error } = await supabase
      .from("case_intakes")
      .upsert({ case_id: id, intake: nextIntake, updated_at: new Date().toISOString() }, { onConflict: "case_id" })
      .select("case_id,intake,updated_at")
      .single();

    if (error) {
      console.error("PATCH /api/cases/[id]/intake failed", { message: error.message, code: (error as any).code, details: (error as any).details });
      return badRequest(error.message);
    }

    // Only enqueue analysis when data actually changed and user is on Pro (avoids re-analysis on every page load)
    const hasChanged = JSON.stringify(nextIntake) !== JSON.stringify(currentIntake);
    if (hasChanged) {
      const plan = await getPlanForUser();
      if (plan === "pro") {
        try {
          await enqueueJob(supabase, user.id, {
            caseId: id,
            jobType: "intake_updated",
            sourceType: "case_intakes",
            sourceId: null,
            payload: { patchKeys: Object.keys(patch ?? {}) },
          });
        } catch {
          // ignore
        }
      }
    }

    return NextResponse.json({ item: data?.intake ?? nextIntake });
  } catch (e: any) {
    return badRequest(e?.message ?? "Failed to update intake");
  }
}
