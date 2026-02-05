//src/components/case/ArchiveCaseButton.tsx
"use client";

import React from "react";

export default function ArchiveCaseButton({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    setBusy(true);
    const next = currentStatus === "archived" ? "active" : "archived";
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    location.reload();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
    >
      {currentStatus === "archived" ? "Unarchive" : "Archive"}
    </button>
  );
}
