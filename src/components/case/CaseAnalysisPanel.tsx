import Link from "next/link";
import { requireUser } from "@/lib/cases";
import CaseFocusPanel from "@/components/case/CaseFocusPanel";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function isOverdue(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

export default async function CaseAnalysisPanel({ caseId }: { caseId: string }) {
  const { supabase, user } = await requireUser();
  const nowIso = new Date().toISOString();

  const [intakeRow, overdueDeadlines, upcomingDeadlines, openTasks, drafts, bundles, focusOutputs, queuedJobs] = await Promise.all([
    supabase.from("case_intakes").select("case_id,intake,updated_at,created_at").eq("case_id", caseId).maybeSingle(),
    supabase
      .from("case_events")
      .select("id,event_at,title,notes,kind")
      .eq("case_id", caseId)
      .eq("kind", "deadline")
      .lt("event_at", nowIso)
      .order("event_at", { ascending: false })
      .limit(5),
    supabase
      .from("case_events")
      .select("id,event_at,title,kind")
      .eq("case_id", caseId)
      .eq("kind", "deadline")
      .gte("event_at", nowIso)
      .order("event_at", { ascending: true })
      .limit(5),
    supabase
      .from("case_tasks")
      .select("id,title,status,kind,due_at,notes,created_at")
      .eq("case_id", caseId)
      .in("status", ["open", "in_progress", "blocked"])
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("case_drafts")
      .select("id,title,kind,status,updated_at,created_at")
      .eq("case_id", caseId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("case_bundles")
      .select("id,title,status,output_path,error,created_at,updated_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("case_ai_outputs")
      .select("id,output_type,title,content,updated_at")
      .eq("case_id", caseId)
      .eq("created_by", user.id)
      .in("output_type", ["case_analysis", "relevance_flag", "motion_recommendation", "deadline_plan"])
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("case_ai_jobs")
      .select("id")
      .eq("case_id", caseId)
      .eq("created_by", user.id)
      .eq("status", "queued")
      .limit(50),
  ]);

  const intake = (intakeRow.data as any)?.intake ?? {};
  const intakeKeys = Object.keys(intake ?? {});
  const filled = intakeKeys.filter((k) => {
    const v = (intake as any)[k];
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return true;
  }).length;

  const queuedBundles = (bundles.data ?? []).filter((b: any) => b.status === "queued").length;
  const readyBundles = (bundles.data ?? []).filter((b: any) => b.status === "ready").length;
  const erroredBundles = (bundles.data ?? []).filter((b: any) => b.error).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-4">
        <CaseFocusPanel
          caseId={caseId}
          openaiConfigured={Boolean(process.env.OPENAI_API_KEY)}
          queuedJobs={(queuedJobs.data ?? []).length}
          outputs={(focusOutputs.data ?? []) as any}
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-white font-semibold">Case health</h3>
          <p className="mt-1 text-sm text-white/70">A quick diagnostic view of what’s missing and what’s urgent.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Card label="Overdue deadlines" value={String(overdueDeadlines.data?.length ?? 0)} tone={(overdueDeadlines.data?.length ?? 0) > 0 ? "bad" : "ok"} />
            <Card label="Upcoming deadlines" value={String(upcomingDeadlines.data?.length ?? 0)} />
            <Card label="Open tasks" value={String(openTasks.data?.length ?? 0)} />
            <Card
              label="Intake completeness"
              value={intakeKeys.length ? `${filled}/${intakeKeys.length}` : "0/0"}
              hint={(intakeRow.data as any)?.updated_at ? `updated ${fmt((intakeRow.data as any).updated_at)}` : "not saved yet"}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-white font-medium">Deadlines</h4>
            <Link href={`/dashboard/cases/${caseId}/events`} className="text-xs text-amber-200 hover:text-amber-100">
              View events
            </Link>
          </div>

          {(overdueDeadlines.data?.length ?? 0) === 0 && (upcomingDeadlines.data?.length ?? 0) === 0 ? (
            <div className="mt-3 text-sm text-white/60">No deadlines yet.</div>
          ) : (
            <ol className="mt-3 space-y-2">
              {(overdueDeadlines.data ?? []).map((d: any) => (
                <li key={d.id} className="rounded-xl border border-red-400/20 bg-red-500/10 p-3">
                  <div className="text-xs text-red-100">OVERDUE • {fmt(d.event_at)}</div>
                  <div className="mt-1 text-sm font-medium text-white">{d.title}</div>
                </li>
              ))}
              {(upcomingDeadlines.data ?? []).map((d: any) => (
                <li key={d.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="text-xs text-white/60">{fmt(d.event_at)}</div>
                  <div className="mt-1 text-sm font-medium text-white">{d.title}</div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-white font-medium">Open tasks</h4>
            <Link href={`/dashboard/cases/${caseId}/discovery`} className="text-xs text-amber-200 hover:text-amber-100">
              View tasks
            </Link>
          </div>

          {!openTasks.data || openTasks.data.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No open tasks.</div>
          ) : (
            <ol className="mt-3 space-y-2">
              {openTasks.data.map((t: any) => (
                <li key={t.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{t.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {t.kind} • {t.status}
                        {t.due_at ? ` • ${isOverdue(t.due_at) ? "OVERDUE" : "due"} ${fmt(t.due_at)}` : ""}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-white font-medium">Drafts</h4>
            <Link href={`/dashboard/cases/${caseId}/drafts`} className="text-xs text-amber-200 hover:text-amber-100">
              View drafts
            </Link>
          </div>

          {!drafts.data || drafts.data.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No drafts yet.</div>
          ) : (
            <ol className="mt-3 space-y-2">
              {drafts.data.map((d: any) => (
                <li key={d.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{d.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {d.kind} • {d.status} • updated {fmt(d.updated_at)}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <a
                        href={`/api/cases/${caseId}/drafts/${d.id}/export/pdf`}
                        className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                      >
                        PDF
                      </a>
                      <a
                        href={`/api/cases/${caseId}/drafts/${d.id}/export/docx`}
                        className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                      >
                        DOCX
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-white font-medium">Bundle pipeline</h4>
            <Link href={`/dashboard/cases/${caseId}/exhibits`} className="text-xs text-amber-200 hover:text-amber-100">
              View bundles
            </Link>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Card label="queued" value={String(queuedBundles)} />
            <Card label="ready" value={String(readyBundles)} />
            <Card label="errors" value={String(erroredBundles)} tone={erroredBundles > 0 ? "bad" : "ok"} />
          </div>

          {!bundles.data || bundles.data.length === 0 ? null : (
            <ol className="mt-3 space-y-2">
              {bundles.data.slice(0, 3).map((b: any) => (
                <li key={b.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{b.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {b.status} • {fmt(b.created_at)}
                      </div>
                      {b.error ? (
                        <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-100">{b.error}</div>
                      ) : null}
                    </div>
                    {b.status === "ready" && b.output_path ? (
                      <a
                        href={`/api/cases/${caseId}/bundles/${b.id}/download`}
                        className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                      >
                        Download
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "bad";
}) {
  const toneClasses =
    tone === "bad"
      ? "border-red-400/20 bg-red-500/10"
      : tone === "ok"
      ? "border-emerald-300/20 bg-emerald-500/10"
      : "border-white/10 bg-black/10";

  return (
    <div className={`rounded-xl border p-3 ${toneClasses}`}>
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/55">{hint}</div> : null}
    </div>
  );
}

