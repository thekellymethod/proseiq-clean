"use client";

import React from "react";
import CaseTimeline from "@/components/case/CaseTimeline";
import CaseTimeline3D from "@/components/case/CaseTimeline3D";
import ProGate from "@/components/billing/ProGate";

type ViewMode = "list" | "3d" | "locked";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseEventsTimelineView({ caseId, plan }: { caseId: string; plan?: "basic" | "pro" | null }) {
  const [mode, setMode] = React.useState<ViewMode>("list");
  const isPro = plan === "pro";

  const handle3dClick = () => {
    if (!isPro) {
      setMode("locked");
      return;
    }
    setMode("3d");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-white/70">View:</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("list")}
            className={cx(
              "rounded-md border px-3 py-2 text-sm",
              mode === "list"
                ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                : "border-white/10 bg-black/10 text-white/80 hover:bg-black/20"
            )}
          >
            List
          </button>
          <button
            type="button"
            onClick={handle3dClick}
            className={cx(
              "flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm",
              mode === "3d"
                ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                : "border-white/10 bg-black/10 text-white/80 hover:bg-black/20"
            )}
          >
            3D {!isPro && <span className="text-xs text-white/50">🔒 Pro</span>}
          </button>
        </div>
      </div>

      {mode === "locked" ? (
        <ProGate feature="3d" />
      ) : mode === "3d" ? (
        <CaseTimeline3D caseId={caseId} />
      ) : (
        <CaseTimeline caseId={caseId} />
      )}
    </div>
  );
}

