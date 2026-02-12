"use client";

import React from "react";
import IntakeWizard from "@/components/intake/IntakeWizard";
import IntakeGuided from "@/components/intake/IntakeGuided";
import LegalDefinitions from "@/components/intake/LegalDefinitions";

type IntakeMode = "form" | "guided";

const MODE_KEY = "intake-mode";

function getStoredMode(caseId: string): IntakeMode {
  if (typeof window === "undefined") return "form";
  try {
    const stored = localStorage.getItem(`${MODE_KEY}-${caseId}`);
    if (stored === "form" || stored === "guided") return stored;
  } catch {
    // ignore
  }
  return "form";
}

function setStoredMode(caseId: string, mode: IntakeMode) {
  try {
    localStorage.setItem(`${MODE_KEY}-${caseId}`, mode);
  } catch {
    // ignore
  }
}

export default function IntakeForm({ caseId }: { caseId: string }) {
  const [mode, setMode] = React.useState<IntakeMode>(() => getStoredMode(caseId));

  React.useEffect(() => {
    setMode(getStoredMode(caseId));
  }, [caseId]);

  function handleModeChange(m: IntakeMode) {
    setMode(m);
    setStoredMode(caseId, m);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-white/70">Intake path</h3>
          <p className="mt-1 text-xs text-white/50">
            Choose how to provide case information. Both paths collect the same data and are analyzed the same way.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("form")}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              mode === "form"
                ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
                : "border-white/10 bg-black/20 text-white/70 hover:bg-black/30 hover:text-white"
            }`}
          >
            Step-by-step form
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("guided")}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              mode === "guided"
                ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
                : "border-white/10 bg-black/20 text-white/70 hover:bg-black/30 hover:text-white"
            }`}
          >
            Guided questions
          </button>
        </div>
      </div>

      {mode === "form" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs md:w-auto">
              <LegalDefinitions />
            </div>
          </div>
          <IntakeWizard caseId={caseId} />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white">Guided intake</h3>
              <p className="text-sm text-white/70">
                Answer questions one at a time. Each question is tailored to your case type and jurisdiction.
              </p>
            </div>
            <div className="w-full max-w-xs md:w-auto">
              <LegalDefinitions />
            </div>
          </div>
          <IntakeGuided caseId={caseId} />
        </div>
      )}
    </section>
  );
}
