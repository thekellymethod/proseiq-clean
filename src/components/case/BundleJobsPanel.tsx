//src/components/case/BundleJobsPanel.tsx

"use client";

import React from "react";

type Job = {
  id: string;
  status: string;
  error: string | null;
  options: any;
  output_bucket: string | null;
  output_path: string | null;
  created_at: string;
  updated_at: string;
};

export default function BundleJobsPanel({ caseId }: { caseId: string }) {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function load() {
    const r = await fetch(`/api/cases/${caseId}/bundle-jobs`, { cache: "no-store" });
    const j = await r.json();
    setJobs(j.items ?? []);
  }

  React.useEffect(() => {
    load();
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createJob() {
    setBusy(true);
    await fetch(`/api/cases/${caseId}/bundle-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bates: { prefix: "PROSEIQ", start: 1, width: 6, mode: "tierB" },
        includeOriginals: true,
      }),
    });
    setBusy(false);
    await load();
  }

  async function run(jobId: string) {
    setBusy(true);
    await fetch(`/api/bundle-jobs/${jobId}/run`, { method: "POST" });
    setBusy(false);
    await load();
  }

  async function download(jobId: string) {
    const r = await fetch(`/api/bundle-jobs/${jobId}/download-url`, { cache: "no-store" });
    const j = await r.json();
    if (j.url) window.open(j.url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Bundle Queue</h3>
          <p className="text-sm text-white/70">Tier B stamps PDFs per-page. Non-PDFs remain Tier A allocation.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={createJob}
            disabled={busy}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
            data-testid="bundle-new-job"
          >
            New Job
          </button>
          <button
            onClick={load}
            className="rounded-md border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/80 hover:bg-black/20"
            data-testid="bundle-refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {jobs.length === 0 ? (
          <div className="text-sm text-white/60">No bundle jobs yet.</div>
        ) : (
          jobs.map((j) => (
            <div key={j.id} className="rounded-lg border border-white/10 bg-black/10 p-3" data-testid={`bundle-job-${j.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">
                    {j.status.toUpperCase()} • {new Date(j.created_at).toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    Job: {j.id.slice(0, 8)} • Updated: {new Date(j.updated_at).toLocaleString()}
                  </div>
                  {j.error ? (
                    <div className="mt-2 rounded border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-100">{j.error}</div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => run(j.id)}
                    disabled={busy || j.status === "running"}
                    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
                    data-testid={`bundle-run-${j.id}`}
                  >
                    Run
                  </button>
                  <button
                    onClick={() => download(j.id)}
                    disabled={busy || j.status !== "done"}
                    className="rounded border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
                    data-testid={`bundle-download-${j.id}`}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
