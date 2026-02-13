import { US_STATES } from "@/lib/analysisReferenceData";

type IntakeData = {
  basics?: { jurisdiction?: string };
};

export default function AnalysisJurisdiction({
  intake,
}: {
  intake: IntakeData;
}) {
  const jurisdiction = (intake?.basics?.jurisdiction ?? "").trim();
  const primaryState = jurisdiction
    ? US_STATES.find(
        (s) =>
          s.code === jurisdiction ||
          s.name.toLowerCase() === jurisdiction.toLowerCase() ||
          jurisdiction.toLowerCase().includes(s.name.toLowerCase())
      )
    : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-white font-medium">Jurisdiction (all 50 states)</h4>
      <p className="mt-1 text-sm text-white/70">
        Reference for jurisdiction-specific rules. Your primary jurisdiction is highlighted.
      </p>

      <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/10 p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
          {US_STATES.map((s) => {
            const isPrimary = primaryState?.code === s.code;
            return (
              <div
                key={s.code}
                className={`flex items-center gap-2 py-1 ${isPrimary ? "rounded bg-amber-500/20 text-amber-100" : "text-white/80"}`}
              >
                <span className="font-mono text-xs text-white/60">{s.code}</span>
                <span>{s.name}</span>
                {isPrimary ? (
                  <span className="text-xs text-amber-200">(primary)</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {primaryState ? (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/10 p-3 text-sm">
          <div className="text-white font-medium">{primaryState.name}</div>
          <div className="mt-1 text-white/70">
            PI: {primaryState.personalInjuryYears ?? "—"} yrs • Contract: {primaryState.contractYears ?? "—"} yrs •
            Defamation: {primaryState.defamationYears ?? "—"} yrs
          </div>
          {primaryState.notes ? (
            <div className="mt-2 text-xs text-amber-200/90">{primaryState.notes}</div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-white/50">
          Set jurisdiction in intake to highlight your primary state.
        </p>
      )}
    </div>
  );
}
