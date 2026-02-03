"use client";

import React from "react";

type Risk = {
  id: string;
  claim: string;
  weakness: string;
  fix: string;
  severity: "low" | "medium" | "high";
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
  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function analyze() {
    setLoading(true);

    try {
      // TODO: Call your AI endpoint:
      // POST /api/cases/[caseId]/devils-advocate  { facts }
      // For now: deterministic placeholders
      setRisks([
        {
          id: "r1",
          claim: "Fraud / misrepresentation",
          weakness: "Intent and reliance must be specific; vague statements won’t survive.",
          fix: "Quote exact representations, attach proof, show reliance, show damages link.",
          severity: "high",
        },
        {
          id: "r2",
          claim: "Deceptive Trade Practices",
          weakness: "Notice + consumer status requirements often trip plaintiffs up.",
          fix: "Document DTPA notice compliance and timeline; attach certified mail proof.",
          severity: "medium",
        },
        {
          id: "r3",
          claim: "Damages",
          weakness: "Numbers may look inflated without receipts and category logic.",
          fix: "Line-item every amount and map each to a document exhibit.",
          severity: "high",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Devil’s Advocate</h3>
        <p className="text-sm text-white/70">
          Stress-test your theory. Identify weaknesses before the defense does.
        </p>
      </div>

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
            {loading ? "Analyzing…" : "Run Devil’s Advocate"}
          </button>

          <div className="mt-3 text-xs text-white/50">
            This panel should be wired to your AI endpoint next. No tsx required.
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/10 p-4">
          {risks.length === 0 ? (
            <div className="text-sm text-white/70">
              No analysis yet. Add facts and run the panel.
            </div>
          ) : (
            <ul className="space-y-2">
              {risks.map((r) => (
                <li key={r.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{r.claim}</div>
                      <div className="mt-2 text-sm text-white/80">
                        <span className="text-white/60">Weakness: </span>
                        {r.weakness}
                      </div>
                      <div className="mt-2 text-sm text-white/80">
                        <span className="text-white/60">Fix: </span>
                        {r.fix}
                      </div>
                    </div>

                    <span className={severityPill(r.severity)}>{r.severity}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 text-xs text-white/50">
            Case: <span className="text-white/70">{caseId}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function severityPill(sev: "low" | "medium" | "high") {
  const base =
    "shrink-0 rounded-full border px-2 py-1 text-xs font-medium";
  if (sev === "high")
    return `${base} border-red-400/30 bg-red-500/10 text-red-100`;
  if (sev === "medium")
    return `${base} border-amber-300/30 bg-amber-300/10 text-amber-50`;
  return `${base} border-white/15 bg-white/5 text-white/80`;
}
