"use client";

import React from "react";

type EvidenceItem = {
  label: string;
  notes?: string;
};

type IntakeData = {
  evidence?: EvidenceItem[];
};

export default function EvidenceStep({
  data,
  setData,
}: {
  data: IntakeData;
  setData: (next: IntakeData) => void;
}) {
  const evidence = data.evidence ?? [];

  function updateItem(i: number, patch: Partial<EvidenceItem>) {
    const next = evidence.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    setData({ ...data, evidence: next });
  }

  function addItem() {
    setData({ ...data, evidence: [...evidence, { label: "", notes: "" }] });
  }

  function removeItem(i: number) {
    setData({ ...data, evidence: evidence.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        For MVP, list what evidence exists. Uploading/attaching docs happens in the Documents tab.
      </div>

      {evidence.length === 0 ? (
        <div className="text-sm text-white/60">No evidence items yet.</div>
      ) : (
        <div className="space-y-3">
          {evidence.map((e, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Item #{i + 1}</div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 grid gap-2">
                <label className="text-xs text-white/70">Label</label>
                <input
                  className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                  value={e.label}
                  onChange={(ev) => updateItem(i, { label: ev.target.value })}
                  placeholder="e.g., Lease agreement PDF, email thread, photos, bank records"
                />
              </div>

              <div className="mt-3 grid gap-2">
                <label className="text-xs text-white/70">Notes (optional)</label>
                <textarea
                  className="min-h-[70px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                  value={e.notes ?? ""}
                  onChange={(ev) => updateItem(i, { notes: ev.target.value })}
                  placeholder="Where it is, what it proves, how it connects to a claim."
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addItem}
        className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
      >
        Add evidence item
      </button>
    </div>
  );
}
