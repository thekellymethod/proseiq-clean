import {
  US_STATES,
  CLAIM_TO_SOL_CATEGORY,
  DEFAULT_SOL,
  type StateInfo,
} from "@/lib/analysisReferenceData";
import Link from "next/link";

type IntakeData = {
  basics?: { jurisdiction?: string };
  claims?: string[];
  facts?: { keyDates?: string };
};

function getSolCategory(claim: string): keyof StateInfo | null {
  const lower = (claim ?? "").toLowerCase();
  for (const [key, cat] of Object.entries(CLAIM_TO_SOL_CATEGORY)) {
    if (lower.includes(key)) return cat as keyof StateInfo;
  }
  return null;
}

function findState(jurisdiction: string): StateInfo | null {
  const j = (jurisdiction ?? "").trim();
  if (!j) return null;
  const match = US_STATES.find(
    (s) => s.code === j || s.name.toLowerCase() === j.toLowerCase() || j.toLowerCase().includes(s.name.toLowerCase())
  );
  return match ?? null;
}

export default function AnalysisStatuteOfLimitations({
  caseId,
  intake,
}: {
  caseId: string;
  intake: IntakeData;
}) {
  const jurisdiction = intake?.basics?.jurisdiction ?? "";
  const claims = intake?.claims ?? [];
  const keyDates = intake?.facts?.keyDates ?? "";

  const state = findState(jurisdiction);
  const primaryClaim = claims[0];
  const solCategory = primaryClaim ? getSolCategory(primaryClaim) : "personalInjuryYears";
  const cat = solCategory ?? "personalInjuryYears";
  const years = state
    ? ((state[cat] as number | undefined) ?? DEFAULT_SOL[cat] ?? 2)
    : (DEFAULT_SOL[cat] ?? 2);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-white font-medium">Statute of limitations</h4>
      <p className="mt-1 text-sm text-white/70">
        Time limits vary by claim type and jurisdiction. Verify with primary sources and local rules.
      </p>

      <div className="mt-4 space-y-3">
        {state ? (
          <div className="rounded-xl border border-white/10 bg-black/10 p-3">
            <div className="text-sm font-medium text-white">Primary jurisdiction: {state.name}</div>
            <div className="mt-2 text-sm text-white/70">
              For {primaryClaim || "your claim type"}: typically {years} year{years !== 1 ? "s" : ""} from accrual.
            </div>
            {state.notes ? (
              <div className="mt-2 text-xs text-amber-200/90">{state.notes}</div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
            <div className="text-sm text-amber-100">Jurisdiction not set</div>
            <p className="mt-1 text-xs text-white/70">
              Add jurisdiction in intake to get jurisdiction-specific SOL. Default: {years} years for many claim types.
            </p>
          </div>
        )}

        {keyDates ? (
          <div className="rounded-xl border border-white/10 bg-black/10 p-3">
            <div className="text-xs text-white/60">Key dates (from intake)</div>
            <div className="mt-1 text-sm text-white/80 whitespace-pre-wrap">{keyDates}</div>
          </div>
        ) : null}

        <p className="text-xs text-white/50">
          Discovery rule, tolling, and equitable estoppel may change accrual. Consult an attorney for your case.
        </p>
      </div>

      <Link href={`/dashboard/cases/${caseId}/intake`} className="mt-3 inline-block text-xs text-amber-200 hover:text-amber-100">
        Update intake
      </Link>
    </div>
  );
}
