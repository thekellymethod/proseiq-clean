//src/components/intake/IntakeWizard.tsx
"use client";

import React from "react";
import CaseBasicsStep from "@/components/intake/steps/CaseBasicsStep";
import PartiesStep from "@/components/intake/steps/PartiesStep";
import ClaimsDefensesStep from "@/components/intake/steps/ClaimsDefensesStep";
import FactsStep from "@/components/intake/steps/FactsStep";
import DamagesStep from "@/components/intake/steps/DamagesStep";
import EvidenceStep from "@/components/intake/steps/EvidenceStep";
import ReviewGenerateStep from "@/components/intake/steps/ReviewGenerateStep";

type StepKey = "basics" | "parties" | "claims" | "facts" | "damages" | "evidence" | "review";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "basics", label: "Case basics" },
  { key: "parties", label: "Parties" },
  { key: "claims", label: "Claims/Defenses" },
  { key: "facts", label: "Facts" },
  { key: "damages", label: "Damages" },
  { key: "evidence", label: "Evidence" },
  { key: "review", label: "Review & Generate" },
];

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function IntakeWizard({ caseId }: { caseId: string }) {
  const [step, setStep] = React.useState<StepKey>("basics");

  function idxOf(k: StepKey) {
    return STEPS.findIndex((s) => s.key === k);
  }

  function go(delta: number) {
    const i = idxOf(step);
    const next = STEPS[Math.max(0, Math.min(STEPS.length - 1, i + delta))]?.key;
    if (next) setStep(next);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Case intake</h3>
          <p className="text-sm text-white/70">
            Capture structured facts once; ProseIQ turns them into timelines, exhibits, drafts, and checklists.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-3">
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={cx(
                "rounded-xl border px-3 py-2 text-sm",
                s.key === step
                  ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                  : "border-white/10 bg-black/20 text-white/70 hover:bg-black/30 hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {step === "basics" ? <CaseBasicsStep caseId={caseId} /> : null}
        {step === "parties" ? <PartiesStep caseId={caseId} /> : null}
        {step === "claims" ? <ClaimsDefensesStep caseId={caseId} /> : null}
        {step === "facts" ? <FactsStep caseId={caseId} /> : null}
        {step === "damages" ? <DamagesStep caseId={caseId} /> : null}
        {step === "evidence" ? <EvidenceStep caseId={caseId} /> : null}
        {step === "review" ? <ReviewGenerateStep caseId={caseId} /> : null}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
        >
          Back
        </button>
        <button
          onClick={() => go(1)}
          className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
        >
          Next
        </button>
      </div>
    </section>
  );
}
