"use client";

import React from "react";

import type { IntakeData } from "@/components/intake/types";

export default function CaseBasicsStep({
  data,
  setData,
}: {
  data: IntakeData;
  setData: React.Dispatch<React.SetStateAction<IntakeData>>;
}) {
  const basics = data.basics ?? {};

  function update(patch: Partial<NonNullable<IntakeData["basics"]>>) {
    setData({ ...data, basics: { ...basics, ...patch } });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm text-white/70">Case title</label>
        <input
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={basics.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="e.g., Plaintiff v. Defendant"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Short description</label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={basics.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="One-paragraph summary of what happened."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Court</label>
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
            value={basics.court ?? ""}
            onChange={(e) => update({ court: e.target.value })}
            placeholder="e.g., County District Court"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Jurisdiction</label>
          <input
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
            value={basics.jurisdiction ?? ""}
            onChange={(e) => update({ jurisdiction: e.target.value })}
            placeholder="e.g., State or Federal"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-white/70">Case number (optional)</label>
        <input
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={basics.caseNumber ?? ""}
          onChange={(e) => update({ caseNumber: e.target.value })}
          placeholder="If filed already"
        />
      </div>
    </div>
  );
}
