"use client";

import React from "react";
import { useRouter } from "next/navigation";

type FocusOutput = {
  id: string;
  output_type: string;
  title: string;
  content: any;
  updated_at: string;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseFocusPanel({
  caseId,
  openaiConfigured,
  queuedJobs,
  outputs,
}: {
  caseId: string;
  openaiConfigured: boolean;
  queuedJobs: number;
  outputs: FocusOutput[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const latest = outputs[0]?.content ?? null;
  const nextActions: string[] = Array.isArray(latest?.nextActions) ? latest.nextActions : [];
  const elements: string[] = Array.isArray(latest?.elementsChecklist) ? latest.elementsChecklist : [];
  const rabbit: string[] = Array.isArray(latest?.rabbitTrails) ? latest.rabbitTrails : [];

  async function runWorker() {
    setError(null);
    setOk(null);
    if (!openaiConfigured) {
      setError("AI is not configured (missing OPENAI_API_KEY).");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/workers/ai/process?limit=8`, { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Worker failed (${res.status})`);
      setOk(`Processed ${j.processed ?? 0} job(s).`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to run analysis worker");
    } finally {
      setBusy(false);
      window.setTimeout(() => setOk(null), 1600);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Focus</h3>
          <p className="mt-1 text-sm text-white/70">
            Proactive guidance based on your latest entries. Verify with primary sources and local rules.
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <button
            onClick={runWorker}
            disabled={busy || queuedJobs === 0}
            className={cx(
              "rounded-md border px-3 py-2 text-sm font-medium",
              "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
              (busy || queuedJobs === 0) && "opacity-60"
            )}
          >
            {busy ? "Running…" : queuedJobs === 0 ? "No queued jobs" : `Run analysis (${queuedJobs})`}
          </button>
          <a
            href={`/dashboard/cases/${caseId}/research`}
            className="text-xs text-amber-200 hover:text-amber-100"
          >
            Open Research
          </a>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}

      {!latest ? (
        <div className="mt-4 text-sm text-white/60">
          No analysis yet. Add an event/intake/document/draft, then run analysis.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 lg:col-span-1">
            <div className="text-xs text-white/60">Next actions</div>
            {nextActions.length === 0 ? (
              <div className="mt-2 text-sm text-white/60">—</div>
            ) : (
              <ol className="mt-2 space-y-1 text-sm text-white/80 list-decimal pl-4">
                {nextActions.slice(0, 5).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 p-3 lg:col-span-1">
            <div className="text-xs text-white/60">Elements checklist</div>
            {elements.length === 0 ? (
              <div className="mt-2 text-sm text-white/60">—</div>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                {elements.slice(0, 8).map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/40">•</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 p-3 lg:col-span-1">
            <div className="text-xs text-white/60">Rabbit trails to avoid</div>
            {rabbit.length === 0 ? (
              <div className="mt-2 text-sm text-white/60">—</div>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                {rabbit.slice(0, 6).map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/40">•</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {outputs.length > 0 ? (
        <div className="mt-4 text-xs text-white/50">
          Latest: <span className="text-white/70">{outputs[0].title}</span>
        </div>
      ) : null}
    </section>
  );
}

