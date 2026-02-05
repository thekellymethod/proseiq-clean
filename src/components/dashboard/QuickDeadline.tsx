"use client";

import React from "react";
import { ModalHost } from "@/components/ui/ModalHost";

type CaseLite = { id: string; title: string };

export default function QuickDeadline({
  cases,
}: {
  cases: CaseLite[];
}) {
  const [open, setOpen] = React.useState(false);
  const [caseId, setCaseId] = React.useState<string>(cases?.[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [eventAt, setEventAt] = React.useState(""); // datetime-local
  const [kind, setKind] = React.useState("deadline");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!caseId && cases?.[0]?.id) setCaseId(cases[0].id);
  }, [cases, caseId]);

  async function submit() {
    setError(null);
    if (!caseId) return setError("Select a case.");
    if (!title.trim()) return setError("Title is required.");
    if (!eventAt) return setError("Date/time is required.");

    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          event_at: new Date(eventAt).toISOString(),
          kind,
          notes: null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to create event");
      setOpen(false);
      setTitle("");
      setEventAt("");
      setKind("deadline");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
      >
        Quick Deadline
      </button>

      <ModalHost open={open} onClose={() => setOpen(false)} title="Add deadline / event">
        {error ? (
          <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-white/70">Case</label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
            >
              {(cases ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70">Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
            >
              <option value="deadline">deadline</option>
              <option value="hearing">hearing</option>
              <option value="filing">filing</option>
              <option value="meeting">meeting</option>
              <option value="note">note</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., File response to motion"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70">Date / time</label>
            <input
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/30"
            />
          </div>

          <button
            onClick={submit}
            disabled={saving}
            className="w-full rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create"}
          </button>
        </div>
      </ModalHost>
    </>
  );
}