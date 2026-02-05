//src/components/case/CaseStrategy.tsx
"use client";

import React from "react";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseStrategy({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [theory, setTheory] = React.useState(
    "Defendant violated statutory notice requirements, then leveraged improper fees and reporting to force an unlawful deficiency."
  );
  const [goals, setGoals] = React.useState(
    "1) Immediate relief/settlement leverage\n2) Remove negative reporting\n3) Recover fees and damages\n4) Position for summary disposition"
  );
  const [proof, setProof] = React.useState(
    "- Contract terms\n- Payment ledger + bank records\n- Notice defects\n- Repo invoice\n- Sale irregularities\n- Credit disputes + continued reporting"
  );

  function save() {
    // TODO: POST /api/cases/[caseId]/strategy
    // Keep as local-first for now.
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Strategy</h3>
        <p className="text-sm text-white/70">
          Your legal theory, objectives, and proof map — in one place.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Theory of the case">
          <textarea
            title="Theory of the case"
            value={theory}
            onChange={(e) => setTheory(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[140px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
          />
        </Card>

        <Card title="Goals">
          <textarea
            title="Goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[140px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
          />
        </Card>

        <Card title="Proof map">
          <textarea
            title="Proof map"
            placeholder="- Contract terms\n- Payment ledger + bank records\n- Notice defects\n- Repo invoice\n- Sale irregularities\n- Credit disputes + continued reporting"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "mt-2 w-full min-h-[140px] rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
          />
        </Card>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-white/50">
          Case: <span className="text-white/70">{caseId}</span>
        </div>

        {!readOnly ? (
          <button
            onClick={save}
            className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-50 hover:bg-amber-300/15"
          >
            Save (wire next)
          </button>
        ) : null}
      </div>
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
