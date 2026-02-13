"use client";

import React from "react";
import type { IntakeData } from "@/components/intake/types";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function splitLines(s: string) {
  return uniq(
    s
      .split(/\r?\n|,/g)
      .map((x) => x.trim())
      .filter(Boolean)
  );
}

export default function ClaimsDefensesStep({
  data,
  setData,
}: {
  data: IntakeData;
  setData: React.Dispatch<React.SetStateAction<IntakeData>>;
}) {
  const [claimsText, setClaimsText] = React.useState(() => (data.claims ?? []).join("\n"));
  const [defensesText, setDefensesText] = React.useState(() => (data.defenses ?? []).join("\n"));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-white font-semibold">Claims & defenses</div>
            <div className="text-sm text-white/60">
              Put each item on its own line. Commas also work. Keep it blunt and specific.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Claims (what you assert)</div>
          <textarea
            value={claimsText}
            onChange={(e) => {
              const next = e.target.value;
              setClaimsText(next);
              setData((prev) => ({ ...prev, claims: splitLines(next) }));
            }}
            rows={10}
            placeholder={`Examples:\n- Breach of contract\n- FCRA: inaccurate reporting\n- Negligent misrepresentation`}
            className={cx(
              "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
              "focus:border-amber-300/30"
            )}
          />
          <div className="mt-2 text-xs text-white/50">{splitLines(claimsText).length} items</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Defenses (what you expect they’ll argue)</div>
          <textarea
            value={defensesText}
            onChange={(e) => {
              const next = e.target.value;
              setDefensesText(next);
              setData((prev) => ({ ...prev, defenses: splitLines(next) }));
            }}
            rows={10}
            placeholder={`Examples:\n- Statute of limitations\n- Failure to mitigate\n- Lack of standing\n- Arbitration clause`}
            className={cx(
              "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
              "focus:border-amber-300/30"
            )}
          />
          <div className="mt-2 text-xs text-white/50">{splitLines(defensesText).length} items</div>
        </div>
      </div>
    </div>
  );
}
