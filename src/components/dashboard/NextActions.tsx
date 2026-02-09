//src/components/dashboard/NextActions.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type Action = {
  id: string;
  case_id: string;
  title: string;
  due_at: string | null;
  kind: string;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default async function NextActions({ limit = 10 }: { limit?: number }) {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,title,kind")
    .gte("event_at", nowIso)
    .order("event_at", { ascending: true })
    .limit(limit);

  const actions: Action[] =
    (data ?? []).map((e) => ({
      id: e.id,
      case_id: e.case_id,
      title: e.title,
      due_at: e.event_at,
      kind: e.kind,
    })) ?? [];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">Next actions</div>
          <div className="text-sm text-white/60">Procedural items coming up across your matters.</div>
        </div>
        <Link href="/dashboard/cases" className="text-sm text-amber-100/80 hover:text-amber-100 underline">
          View cases
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {actions.length === 0 ? (
          <div className="text-sm text-white/60">Nothing queued.</div>
        ) : (
          actions.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/cases/${a.case_id}/timeline`}
              className="block rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-black/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{a.title}</div>
                  <div className="text-xs text-white/60">{a.kind}</div>
                </div>
                <div className="shrink-0 text-xs text-white/60">{fmtDate(a.due_at)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
