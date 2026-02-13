"use client";

import React from "react";

import type { IntakeData } from "@/components/intake/types";

export default function FactsStep({
  data,
  setData,
}: {
  data: IntakeData;
  setData: React.Dispatch<React.SetStateAction<IntakeData>>;
}) {
  const facts = data.facts ?? {};

  function update(patch: Partial<NonNullable<IntakeData["facts"]>>) {
    setData({ ...data, facts: { ...facts, ...patch } });
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        Write it like a timeline narrative. Plain language beats “legal voice.”
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Narrative</label>
        <textarea
          className="min-h-[180px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={facts.narrative ?? ""}
          onChange={(e) => update({ narrative: e.target.value })}
          placeholder="Start with what happened, then major events in order…"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Key dates (optional)</label>
        <textarea
          className="min-h-[90px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={facts.keyDates ?? ""}
          onChange={(e) => update({ keyDates: e.target.value })}
          placeholder="e.g. 01/10/2026 – Notice sent; 01/22/2026 – locked out; etc."
        />
      </div>
    </div>
  );
}
