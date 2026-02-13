"use client";

import React from "react";

type DevilsAdvocateResult = {
  weakest_points: { point: string; why_opponent_wins: string }[];
  counter_moves: { move: string; how_to_counter: string }[];
  questions_to_answer: string[];
  settlement_pressure_points: string[];
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function DevilsAdvocate({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [facts, setFacts] = React.useState("");
  const [result, setResult] = React.useState<DevilsAdvocateResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function analyze() {
    if (!facts.trim()) {
      setError("Add facts or narrative to run analysis.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/devils-advocate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ case_summary: facts }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Failed to analyze");
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Devil&apos;s Advocate</h3>
        <p className="text-sm text-white/70">
          Stress-test your theory. Identify weaknesses before the defense does.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-black/10 p-4">
          <label className="text-xs text-white/70">Facts / narrative</label>
          <textarea
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[180px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
            placeholder="Paste your case narrative, timeline, key documents, and what you want to prove."
          />

          <button
            onClick={analyze}
            disabled={!!readOnly || loading}
            className={cx(
              "mt-3 w-full rounded-md px-3 py-2 text-sm font-medium",
              "border border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/15",
              (readOnly || loading) && "opacity-60"
            )}
          >
            {loading ? "Analyzing…" : "Run Devil's Advocate"}
          </button>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/10 p-4">
          {!result ? (
            <div className="text-sm text-white/70">
              No analysis yet. Add facts and run the panel.
            </div>
          ) : (
            <div className="space-y-4">
              {result.weakest_points?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-white">Weakest points</div>
                  <ul className="mt-2 space-y-2">
                    {result.weakest_points.map((w, idx) => (
                      <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="font-medium text-white">{w.point}</div>
                        <div className="mt-1 text-sm text-white/70">
                          <span className="text-white/60">Why opponent wins: </span>
                          {w.why_opponent_wins}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.counter_moves?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-white">Counter moves</div>
                  <ul className="mt-2 space-y-2">
                    {result.counter_moves.map((c, idx) => (
                      <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="text-white">{c.move}</div>
                        <div className="mt-1 text-sm text-white/70">
                          <span className="text-white/60">How to counter: </span>
                          {c.how_to_counter}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.questions_to_answer?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-white">Questions to answer</div>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-white/80">
                    {result.questions_to_answer.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.settlement_pressure_points?.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-white">Settlement pressure points</div>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-white/80">
                    {result.settlement_pressure_points.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
