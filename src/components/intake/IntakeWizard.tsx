"use client";

import React from "react";
import CaseBasicsStep from "@/components/intake/steps/CaseBasicsStep";
import PartiesStep from "@/components/intake/steps/PartiesStep";
import ClaimsDefensesStep from "@/components/intake/steps/ClaimsDefensesStep";
import FactsStep from "@/components/intake/steps/FactsStep";
import DamagesStep from "@/components/intake/steps/DamagesStep";
import EvidenceStep from "@/components/intake/steps/EvidenceStep";
import ReviewGenerateStep from "@/components/intake/steps/ReviewGenerateStep";

import { emptyIntakeData, type IntakeData } from "@/components/intake/types";
import { useAutosave } from "@/components/intake/useAutosave";

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

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { error: text || `HTTP ${res.status}` };
  }
}

export default function IntakeWizard({ caseId }: { caseId: string }) {
  const [step, setStep] = React.useState<StepKey>("basics");
  const [data, setData] = React.useState<IntakeData>(() => emptyIntakeData());
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function idxOf(k: StepKey) {
    return STEPS.findIndex((s) => s.key === k);
  }

  function go(delta: number) {
    const i = idxOf(step);
    const next = STEPS[Math.max(0, Math.min(STEPS.length - 1, i + delta))]?.key;
    if (next) setStep(next);
  }

  async function load() {
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, { method: "GET" });
      if (!res.ok) {
        // not fatal; intake may simply not exist yet
        return;
      }
      const payload = await safeJson(res);
      const next = payload?.item ?? {};
      if (next && typeof next === "object") {
        setData({ ...emptyIntakeData(), ...(next as IntakeData) });
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load intake.");
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const saveFn = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch: data }),
      });
      const payload = await safeJson(res);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to save intake.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save intake.");
    } finally {
      setBusy(false);
    }
  }, [caseId, data]);

  useAutosave(saveFn, data, { debounceMs: 2500 });

  const save = saveFn;

  async function seed() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await safeJson(res);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to seed timeline/exhibits/drafts.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to seed timeline/exhibits/drafts.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4" key={caseId}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Case intake</h3>
          <p className="text-sm text-white/70">
            Capture structured facts once; ProseIQ turns them into timelines, exhibits, drafts, and checklists.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void save()}
            disabled={busy}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30 disabled:opacity-60"
          >
            Save
          </button>
          <button
            onClick={() => void seed()}
            disabled={busy}
            className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
          >
            Generate
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

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
        {step === "basics" ? <CaseBasicsStep data={data} setData={setData} /> : null}
        {step === "parties" ? <PartiesStep data={data} setData={setData} /> : null}
        {step === "claims" ? <ClaimsDefensesStep data={data} setData={setData} /> : null}
        {step === "facts" ? <FactsStep data={data} setData={setData} /> : null}
        {step === "damages" ? <DamagesStep data={data} setData={setData} /> : null}
        {step === "evidence" ? <EvidenceStep data={data} setData={setData} /> : null}
        {step === "review" ? (
          <ReviewGenerateStep data={data} onSave={save} onSeed={seed} busy={busy} error={error ?? undefined} />
        ) : null}
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
