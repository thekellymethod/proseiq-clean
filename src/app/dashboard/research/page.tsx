import Link from "next/link";
import Template from "@/components/layout/Template";
import { requireUser, listCases } from "@/lib/cases";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default async function DashboardResearchPage() {
  const { supabase } = await requireUser();

  const [cases, pinned] = await Promise.all([
    listCases(),
    supabase
      .from("case_ai_outputs")
      .select("id,case_id,title,content,pinned,updated_at,cases(title)")
      .eq("output_type", "research_hit")
      .eq("pinned", true)
      .order("updated_at", { ascending: false })
      .limit(200),
  ]);

  const pinnedRows = (pinned.data ?? []) as any[];
  const pinnedByCase = new Map<string, any[]>();
  for (const r of pinnedRows) {
    const arr = pinnedByCase.get(r.case_id) ?? [];
    arr.push(r);
    pinnedByCase.set(r.case_id, arr);
  }

  return (
    <Template
      title="Research"
      subtitle="Pinned authority and quick links into each case."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-1">
          <div className="text-lg font-semibold text-white">Cases</div>
          <div className="mt-3 space-y-2">
            {cases.length === 0 ? (
              <div className="text-sm text-white/60">No cases yet.</div>
            ) : (
              cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/cases/${c.id}/assistant`}
                  className="block rounded-xl border border-white/10 bg-black/10 p-3 hover:bg-black/20"
                >
                  <div className="truncate text-sm font-medium text-white">{c.title}</div>
                  <div className="mt-1 text-xs text-white/60">
                    {pinnedByCase.get(c.id)?.length ?? 0} pinned • {c.status}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-white">Pinned authority</div>
              <div className="mt-1 text-sm text-white/70">
                These are pinned from case Research. Open a case Assistant page to search and pin more.
              </div>
            </div>
            <Link
              href="/dashboard/cases"
              className="shrink-0 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
            >
              All cases
            </Link>
          </div>

          {pinnedRows.length === 0 ? (
            <div className="mt-4 text-sm text-white/60">No pinned authority yet.</div>
          ) : (
            <ol className="mt-4 space-y-2">
              {pinnedRows.map((r) => {
                const cTitle = r.cases?.title ?? "Case";
                const url = String(r.content?.url ?? "");
                const citation = String(r.content?.citation ?? r.title ?? "");
                const hitTitle = String(r.content?.title ?? "");
                return (
                  <li key={r.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-white/60">
                          <Link className="text-amber-200 hover:text-amber-100" href={`/dashboard/cases/${r.case_id}/research`}>
                            {cTitle}
                          </Link>{" "}
                          • updated {fmt(r.updated_at)}
                        </div>
                        <div className="mt-1 text-sm font-medium text-amber-100">{citation}</div>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block truncate text-xs text-sky-200/90 hover:text-sky-200"
                          >
                            {hitTitle || url}
                          </a>
                        ) : null}
                        {r.content?.quotedText ? (
                          <div className="mt-2 rounded border border-white/10 bg-black/20 p-2 text-xs text-white/70">
                            “{String(r.content.quotedText)}”
                          </div>
                        ) : null}
                      </div>
                      <Link
                        href={`/dashboard/cases/${r.case_id}/assistant`}
                        className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                      >
                        Open case
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </Template>
  );
}

