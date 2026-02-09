"use client";

import React from "react";

type DamageItem = {
  label: string;
  amount?: number;
  notes?: string;
};

type IntakeData = {
  damages?: {
    items?: DamageItem[];
    narrative?: string;
  };
};

export default function DamagesStep({
  data,
  setData,
}: {
  data: IntakeData;
  setData: (next: IntakeData) => void;
}) {
  const damages = data.damages ?? {};
  const items = damages.items ?? [];

  function updateDamages(patch: Partial<NonNullable<IntakeData["damages"]>>) {
    setData({ ...data, damages: { ...damages, ...patch } });
  }

  function updateItem(i: number, patch: Partial<DamageItem>) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    updateDamages({ items: next });
  }

  function addItem() {
    updateDamages({ items: [...items, { label: "", amount: undefined, notes: "" }] });
  }

  function removeItem(i: number) {
    updateDamages({ items: items.filter((_, idx) => idx !== i) });
  }

  const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        Add line-items where you can. You can be approximate for MVP.
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/60">Estimated total</div>
        <div className="mt-1 text-2xl font-semibold text-white">
          ${total.toLocaleString()}
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No damages yet.</div>
        ) : (
          items.map((it, i) => (
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

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Label</label>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                    value={it.label}
                    onChange={(e) => updateItem(i, { label: e.target.value })}
                    placeholder="e.g., Storage fees, repair costs, lost wages"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Amount</label>
                  <input
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                    value={it.amount ?? ""}
                    onChange={(e) =>
                      updateItem(i, {
                        amount: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    placeholder="e.g., 2500"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <label className="text-xs text-white/70">Notes (optional)</label>
                <textarea
                  className="min-h-[70px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                  value={it.notes ?? ""}
                  onChange={(e) => updateItem(i, { notes: e.target.value })}
                  placeholder="How you calculated it, what proof exists, etc."
                />
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
      >
        Add damage item
      </button>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Damages narrative (optional)</label>
        <textarea
          className="min-h-[120px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={damages.narrative ?? ""}
          onChange={(e) => updateDamages({ narrative: e.target.value })}
          placeholder="Explain the harm and why the amounts are reasonable."
        />
      </div>
    </div>
  );
}
