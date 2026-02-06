"use client";

import React from "react";

type CaseOption = { id: string; title: string };

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function QuickDeadline({ cases }: { cases: CaseOption[] }) {
  const [open, setOpen] = React.useState(false);
  const [caseId, setCaseId] = React.useState(cases?.[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState("");
  const [kind, setKind] = React.useState("deadline");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setTitle("");
    setDate("");
    setKind("deadline");
    setNotes("");
    setError(null);
  }

  async function submit() {
    setError(null);
    const t = title.trim();
    const d = date.trim();
    if (!caseId) return setError("Select a case.");
    if (!t || !d) return setError("Title and date are required.");
    setSaving(true);
    try {
      await jsonFetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        body: JSON.stringify({
          title: t,
          kind,
          notes: notes.trim() || null,
          event_at: new Date(d).toISOString(),
        }),
      });
      reset();
      setOpen(false);
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
        className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
      >
        Quick deadline
      </button>

      {open ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">Add deadline</div>
                <div className="text-sm text-white/60">Create a case event in one move.</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
              >
                Close
              </button>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Case</label>
                  <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., File response to motion"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Kind</label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  >
                    <option value="deadline">deadline</option>
                    <option value="hearing">hearing</option>
                    <option value="filing">filing</option>
                    <option value="meeting">meeting</option>
                    <option value="note">note</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Notes (optional)</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="short context"
                    className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <button
                onClick={submit}
                disabled={saving}
                className={cx(
                  "rounded-md border px-3 py-2 text-sm font-medium",
                  "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
                  saving && "opacity-60"
                )}
              >
                {saving ? "Saving…" : "Create deadline"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
