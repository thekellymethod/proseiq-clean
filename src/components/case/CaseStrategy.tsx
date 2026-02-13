"use client";

import React from "react";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type StrategyResult = {
  issues: { title: string; why_it_matters: string }[];
  evidence_gaps: { gap: string; how_to_fill: string }[];
  next_actions: { action: string; priority: string }[];
  risks: { risk: string; mitigation: string }[];
};

export default function CaseStrategy({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [theory, setTheory] = React.useState("");
  const [goals, setGoals] = React.useState("");
  const [proof, setProof] = React.useState("");
  const [result, setResult] = React.useState<StrategyResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    const summary = [theory, goals, proof].filter(Boolean).join("\n\n");
    if (!summary.trim()) {
      setError("Add theory, goals, or proof map to generate strategy.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/strategy`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ case_summary: summary }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Failed to generate");
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Strategy</h3>
        <p className="text-sm text-white/70">
          Your legal theory, objectives, and proof map — in one place.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Theory of the case">
          <textarea
            value={theory}
            onChange={(e) => setTheory(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[140px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
            placeholder="Your legal theory and what you intend to prove."
          />
        </Card>

        <Card title="Goals">
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[140px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
            placeholder="Objectives and desired outcomes."
          />
        </Card>

        <Card title="Proof map">
          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[140px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
            placeholder="Evidence and documents that support each element."
          />
        </Card>
      </div>

      {!readOnly && (
        <div className="mt-4">
          <button
            onClick={generate}
            disabled={loading}
            className={cx(
              "rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-50 hover:bg-amber-300/15",
              loading && "opacity-60"
            )}
          >
            {loading ? "Generating…" : "Generate Strategy"}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {result.issues?.length > 0 && (
            <Card title="Issues">
              <ul className="mt-2 space-y-2">
                {result.issues.map((i, idx) => (
                  <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="font-medium text-white">{i.title}</div>
                    <div className="mt-1 text-sm text-white/70">{i.why_it_matters}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {result.evidence_gaps?.length > 0 && (
            <Card title="Evidence gaps">
              <ul className="mt-2 space-y-2">
                {result.evidence_gaps.map((g, idx) => (
                  <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="text-white">{g.gap}</div>
                    <div className="mt-1 text-sm text-white/70">{g.how_to_fill}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {result.next_actions?.length > 0 && (
            <Card title="Next actions">
              <ul className="mt-2 space-y-2">
                {result.next_actions.map((a, idx) => (
                  <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="text-white">{a.action}</div>
                    <span className="mt-1 inline-block rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-100">
                      {a.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {result.risks?.length > 0 && (
            <Card title="Risks">
              <ul className="mt-2 space-y-2">
                {result.risks.map((r, idx) => (
                  <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="text-white">{r.risk}</div>
                    <div className="mt-1 text-sm text-white/70">{r.mitigation}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="text-sm font-medium text-white">{title}</div>
      {children}
    </div>
  );
}
