import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import { requireUser } from "@/lib/cases";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default async function CaseExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const { data: drafts } = await supabase
    .from("case_drafts")
    .select("id,title,kind,status,updated_at,created_at")
    .eq("case_id", id)
    .order("updated_at", { ascending: false })
    .limit(50);

  const { data: bundles } = await supabase
    .from("case_bundles")
    .select("id,title,status,output_path,include_bates,bates_prefix,bates_start,error,created_at,updated_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <CaseWorkspaceShell caseId={id} active="export">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-white font-semibold">Draft exports</h2>
          <p className="mt-1 text-sm text-white/70">Export any draft to PDF or DOCX.</p>

          {!drafts || drafts.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No drafts yet.</div>
          ) : (
            <ol className="mt-4 space-y-2">
              {drafts.map((d) => (
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
                        href={`/api/cases/${id}/drafts/${d.id}/export/pdf`}
                        className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                      >
                        PDF
                      </a>
                      <a
                        href={`/api/cases/${id}/drafts/${d.id}/export/docx`}
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
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-white font-semibold">Bundles</h2>
          <p className="mt-1 text-sm text-white/70">
            Bundles are generated exhibit packets. Download is available once a bundle is marked ready.
          </p>

          {!bundles || bundles.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No bundles yet.</div>
          ) : (
            <ol className="mt-4 space-y-2">
              {bundles.map((b) => (
                <li key={b.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{b.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {b.status} • {fmt(b.created_at)}
                        {b.include_bates ? " • Bates" : ""}
                      </div>
                      {b.error ? (
                        <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-100">
                          {b.error}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {b.status === "ready" && b.output_path ? (
                        <a
                          href={`/api/cases/${id}/bundles/${b.id}/download`}
                          className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-white/50">not ready</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </CaseWorkspaceShell>
  );
}
