
import Link from "next/link";
import Template from "@/components/layout/Template";
import { listCases } from "@/lib/cases";
import { createClient } from "@/utils/supabase/server";
import QuickDeadline from "@/components/dashboard/QuickDeadline";

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

function kindLabel(kind: string) {
  const k = (kind || "").toLowerCase();
  if (k === "deadline") return "Deadline";
  if (k === "hearing") return "Hearing";
  if (k === "meeting") return "Meeting";
  if (k === "filing") return "Filing";
  return "Event";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const cases = await listCases();
  const nowIso = new Date().toISOString();

  const { data: upcoming } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,title,kind")
    .gte("event_at", nowIso)
    .order("event_at", { ascending: true })
    .limit(8);

  const { data: overdue } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,title,kind")
    .lt("event_at", nowIso)
    .eq("kind", "deadline")
    .order("event_at", { ascending: false })
    .limit(8);

  const activeCount = cases.filter((c) => c.status === "active").length;

  return (
    <Template
      title="Dashboard"
      subtitle="Deadlines, active matters, and next actions."
      actions={
        <div className="flex gap-2">
          <QuickDeadline cases={cases.map((c) => ({ id: c.id, title: c.title }))} />
          <Link
            href="/dashboard/cases/new"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            New Case
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Total cases</div>
          <div className="mt-1 text-3xl font-semibold text-white">{cases.length}</div>
          <div className="mt-2 text-sm text-white/50">Active: {activeCount}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Upcoming</div>
          <div className="mt-1 text-3xl font-semibold text-white">{upcoming?.length ?? 0}</div>
          <div className="mt-2 text-sm text-white/50">{upcoming?.[0] ? fmt(upcoming[0].event_at) : "—"}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Overdue deadlines</div>
          <div className="mt-1 text-3xl font-semibold text-white">{overdue?.length ?? 0}</div>
          <div className="mt-2 text-sm text-white/50">{overdue?.[0] ? `Most recent: ${fmt(overdue[0].event_at)}` : "—"}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold text-white">Upcoming events</div>
          <div className="mt-3 space-y-2">
            {(upcoming ?? []).length === 0 ? (
              <div className="text-sm text-white/60">
                No upcoming events. Add one with <span className="text-white/80">Quick Deadline</span>.
              </div>
            ) : (
              (upcoming ?? []).map((e) => (
                <Link key={e.id} href={`/dashboard/cases/${e.case_id}`} className="block rounded-lg border border-white/10 bg-black/20 p-3 hover:bg-black/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{e.title}</div>
                      <div className="text-xs text-white/60">{kindLabel(e.kind)}</div>
                    </div>
                    <div className="shrink-0 text-xs text-white/60">{fmt(e.event_at)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold text-white">Overdue deadlines</div>
          <div className="mt-3 space-y-2">
            {(overdue ?? []).length === 0 ? (
              <div className="text-sm text-white/60">No overdue deadlines.</div>
            ) : (
              (overdue ?? []).map((e) => (
                <Link key={e.id} href={`/dashboard/cases/${e.case_id}`} className="block rounded-lg border border-red-400/20 bg-red-500/10 p-3 hover:bg-red-500/15">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{e.title}</div>
                      <div className="text-xs text-white/60">{kindLabel(e.kind)}</div>
                    </div>
                    <div className="shrink-0 text-xs text-white/60">{fmt(e.event_at)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </Template>
  );
}
