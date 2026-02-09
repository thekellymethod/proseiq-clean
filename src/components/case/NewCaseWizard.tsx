//src/components/case/NewCaseWizard.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const MATTER_TYPES = [
  "General",
  "Contract / Debt",
  "Credit Reporting",
  "Landlord–Tenant",
  "Employment",
  "Small Claims",
  "Consumer Protection",
  "Arbitration (General)",
];

const FORUMS = ["Court", "Arbitration", "Administrative", "Other"];

export default function NewCaseWizard() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [caseType, setCaseType] = React.useState("General");
  const [forum, setForum] = React.useState("Court");
  const [priority, setPriority] = React.useState("Normal");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function create() {
    setError(null);
    if (!title.trim()) {
      setError("Case title is required.");
      return;
    }

    setBusy(true);
    try {
      const r = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          case_type: caseType,
          forum,
          priority,
          status: "intake",
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to create case.");

      const id = j?.item?.id as string | undefined;
      if (!id) throw new Error("Missing case id.");

      router.push(`/dashboard/cases/${id}/intake`);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="text-white font-semibold">Create case</div>
      <div className="mt-1 text-sm text-white/70">
        This intake seeds a workflow: timeline milestones, exhibit labels, and a draft-ready workspace.
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs text-white/70">Case title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Tenant security deposit dispute"
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/70">Matter type</label>
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          >
            {MATTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/70">Forum</label>
          <select
            value={forum}
            onChange={(e) => setForum(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          >
            {FORUMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/70">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
          >
            {["Low", "Normal", "High", "Urgent"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={create}
            disabled={busy}
            className={cx(
              "w-full rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20",
              busy && "opacity-60"
            )}
          >
            {busy ? "Creating…" : "Continue to intake"}
          </button>
        </div>
      </div>
    </div>
  );
}
