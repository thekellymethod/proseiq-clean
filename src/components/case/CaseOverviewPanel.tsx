import Link from "next/link";
import CaseStrategy from "@/components/case/CaseStrategy";
import { requireUser } from "@/lib/cases";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default async function CaseOverviewPanel({ caseId }: { caseId: string }) {
  const { supabase } = await requireUser();
  const nowIso = new Date().toISOString();

  const [openTasks, upcomingDeadlines, recentDrafts, counts, bundles] = await Promise.all([
    supabase
      .from("case_tasks")
      .select("id,title,status,kind,due_at,notes,created_at")
      .eq("case_id", caseId)
      .in("status", ["open", "in_progress", "blocked"])
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("case_events")
      .select("id,event_at,kind,title")
      .eq("case_id", caseId)
      .eq("kind", "deadline")
      .gte("event_at", nowIso)
      .order("event_at", { ascending: true })
      .limit(6),
    supabase
      .from("case_drafts")
      .select("id,title,kind,status,updated_at")
      .eq("case_id", caseId)
      .order("updated_at", { ascending: false })
      .limit(5),
    Promise.all([
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("case_id", caseId),
      supabase.from("case_exhibits").select("id", { count: "exact", head: true }).eq("case_id", caseId),
      supabase.from("case_events").select("id", { count: "exact", head: true }).eq("case_id", caseId),
      supabase.from("case_tasks").select("id", { count: "exact", head: true }).eq("case_id", caseId),
      supabase.from("case_bundles").select("id", { count: "exact", head: true }).eq("case_id", caseId),
    ]),
    supabase
      .from("case_bundles")
      .select("id,title,status,output_path,error,created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const documentsCount = counts[0].count ?? 0;
  const exhibitsCount = counts[1].count ?? 0;
  const eventsCount = counts[2].count ?? 0;
  const tasksCount = counts[3].count ?? 0;
  const bundlesCount = counts[4].count ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold">At a glance</h3>
              <p className="mt-1 text-sm text-white/70">Quick status, deadlines, and next steps.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Open tasks" value={String(openTasks.data?.length ?? 0)} href={`/dashboard/cases/${caseId}/discovery`} />
            <Stat label="Upcoming deadlines" value={String(upcomingDeadlines.data?.length ?? 0)} href={`/dashboard/cases/${caseId}/events`} />
            <Stat label="Documents" value={String(documentsCount)} href={`/dashboard/cases/${caseId}/documents`} />
            <Stat label="Exhibits" value={String(exhibitsCount)} href={`/dashboard/cases/${caseId}/exhibits`} />
            <Stat label="Drafts" value={String(recentDrafts.data?.length ?? 0)} href={`/dashboard/cases/${caseId}/drafts`} />
            <Stat label="Bundles" value={String(bundlesCount)} href={`/dashboard/cases/${caseId}/exhibits`} />
          </div>

          <div className="mt-3 text-xs text-white/50">Total events: {eventsCount} • Total tasks: {tasksCount}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-white font-medium">Next actions</h4>
            <Link href={`/dashboard/cases/${caseId}/discovery`} className="text-xs text-amber-200 hover:text-amber-100">
              View all
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
                        {t.due_at ? ` • due ${fmt(t.due_at)}` : ""}
                      </div>
                      {t.notes ? <div className="mt-2 text-xs text-white/70 line-clamp-2">{t.notes}</div> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-white font-medium">Bundle status</h4>
            <Link href={`/dashboard/cases/${caseId}/exhibits`} className="text-xs text-amber-200 hover:text-amber-100">
              Manage bundles
            </Link>
          </div>

          {!bundles.data || bundles.data.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No bundles yet.</div>
          ) : (
            <ol className="mt-3 space-y-2">
              {bundles.data.map((b: any) => (
                <li key={b.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{b.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {b.status} • {fmt(b.created_at)}
                      </div>
                      {b.error ? (
                        <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-100">
                          {b.error}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0">
                      {b.status === "ready" && b.output_path ? (
                        <a
                          href={`/api/cases/${caseId}/bundles/${b.id}/download`}
                          className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-white/50">{b.status}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <CaseStrategy caseId={caseId} />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-white font-medium">Recent drafts</h4>
          {!recentDrafts.data || recentDrafts.data.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No drafts yet.</div>
          ) : (
            <ol className="mt-3 space-y-2">
              {recentDrafts.data.map((d: any) => (
                <li key={d.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{d.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {d.kind} • {d.status} • updated {fmt(d.updated_at)}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/cases/${caseId}/drafts/${d.id}`}
                      className={cx(
                        "shrink-0 rounded-md border px-2 py-1 text-xs",
                        "border-white/10 bg-black/20 text-white/80 hover:bg-black/30"
                      )}
                    >
                      Open
                    </Link>
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

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-white/10 bg-black/10 p-3 hover:bg-black/20">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </Link>
  );
}

