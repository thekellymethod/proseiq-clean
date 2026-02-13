"use client";

import React from "react";

type ElementItem = {
  element: string;
  satisfied: boolean;
  evidence?: string;
};

export default function AnalysisElementsSatisfied({
  elementsSatisfied,
  elementsChecklist,
}: {
  elementsSatisfied?: ElementItem[];
  elementsChecklist?: string[];
}) {
  // Prefer elementsSatisfied (discernment) if available; fall back to checklist
  const items = elementsSatisfied?.length
    ? elementsSatisfied.map((e) => ({ label: e.element, satisfied: e.satisfied, evidence: e.evidence }))
    : (elementsChecklist ?? []).map((x) => ({ label: x, satisfied: false, evidence: undefined }));

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-white font-medium">Elements satisfied</h4>
        <p className="mt-3 text-sm text-white/60">
          Run analysis to see which claim elements are satisfied vs. missing. Elements are derived from your claims and evidence.
        </p>
      </div>
    );
  }

  const satisfied = items.filter((x) => x.satisfied).length;
  const total = items.length;
  const isFallback = !elementsSatisfied?.length && (elementsChecklist ?? []).length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h4 className="text-white font-medium">Elements satisfied</h4>
      <p className="mt-1 text-sm text-white/70">
        {isFallback
          ? "Items to prove / evidence gaps. Run analysis again for full discernment of satisfied vs. missing elements."
          : "Discernment of which elements are satisfied vs. missing based on available evidence."}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-emerald-300/90">{satisfied} satisfied</span>
        <span className="text-white/40">•</span>
        <span className="text-amber-300/90">{total - satisfied} to establish</span>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-3">
            <span
              className={item.satisfied ? "text-emerald-400" : "text-amber-400/80"}
              aria-label={item.satisfied ? "Satisfied" : "Not satisfied"}
            >
              {item.satisfied ? "✓" : "○"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white">{item.label}</div>
              {item.evidence && item.satisfied ? (
                <div className="mt-1 text-xs text-white/60">Evidence: {item.evidence}</div>
              ) : !item.satisfied && item.evidence ? (
                <div className="mt-1 text-xs text-amber-200/80">Gap: {item.evidence}</div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
