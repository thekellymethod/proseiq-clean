"use client";

import React from "react";

type IntakeData = {
  basics?: { title?: string; description?: string };
  parties?: any[];
  facts?: { narrative?: string };
  claims?: string[];
  defenses?: string[];
  damages?: { items?: { amount?: number }[] };
  evidence?: any[];
};

export default function ReviewGenerateStep({
  data,
  onSave,
  onSeed,
  busy,
  error,
}: {
  data: IntakeData;
  onSave?: () => Promise<void> | void;
  onSeed?: () => Promise<void> | void;
  busy?: boolean;
  error?: string | null;
}) {
  const totalDamages =
    data.damages?.items?.reduce((sum, it) => sum + (Number(it.amount) || 0), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        Review what you’ve entered. For MVP: save intake + generate skeleton.
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Title</div>
          <div className="mt-1 text-sm text-white">{data.basics?.title ?? "—"}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Parties</div>
          <div className="mt-1 text-sm text-white">{data.parties?.length ?? 0}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Claims</div>
          <div className="mt-1 text-sm text-white">{data.claims?.length ?? 0}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Estimated damages</div>
          <div className="mt-1 text-sm text-white">${totalDamages.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save intake"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onSeed}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
        >
          {busy ? "Working..." : "Generate skeleton (timeline/exhibits/drafts)"}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
        Note: “Generate skeleton” should call your <code>/api/cases/[id]/intake/seed</code> route
        and create starter records, not magical AI hallucinations.
      </div>
    </div>
  );
}
