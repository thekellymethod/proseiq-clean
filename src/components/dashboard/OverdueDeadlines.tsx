import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default async function OverdueDeadlines({ limit = 8 }: { limit?: number }) {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data } = await supabase
    .from("case_events")
    .select("id,case_id,event_at,title,kind")
    .lt("event_at", nowIso)
    .eq("kind", "deadline")
    .order("event_at", { ascending: false })
    .limit(limit);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-lg font-semibold text-white">Overdue deadlines</div>
      <div className="mt-3 space-y-2">
        {(data ?? []).length === 0 ? (
          <div className="text-sm text-white/60">No overdue deadlines.</div>
        ) : (
          (data ?? []).map((e) => (
            <Link
              key={e.id}
              href={`/dashboard/cases/${e.case_id}/timeline`}
              className="block rounded-xl border border-red-400/20 bg-red-500/10 p-3 hover:bg-red-500/15"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{e.title}</div>
                  <div className="text-xs text-white/60">{e.kind}</div>
                </div>
                <div className="shrink-0 text-xs text-white/60">{fmt(e.event_at)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
