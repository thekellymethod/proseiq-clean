"use client";

import React from "react";

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

export default function CaseSettings({ caseId }: { caseId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState("active");

  const load = React.useCallback(async () => {
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}`, { method: "GET" });
      const c = j.item;
      setTitle(c?.title ?? "");
      setDescription(c?.description ?? "");
      setStatus(c?.status ?? "active");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setError(null);
    setOk(null);
    setSaving(true);
    try {
      await jsonFetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        body: JSON.stringify({ patch: { title: title.trim(), description: description.trim(), status } }),
      });
      setOk("Saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
      setTimeout(() => setOk(null), 1200);
    }
  }

  if (loading) return <div className="text-sm text-white/60">Loading…</div>;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Case settings</h3>
          <p className="text-sm text-white/70">Rename the matter, adjust status.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}
      {ok ? <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{ok}</div> : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-1">
          <label className="text-xs text-white/70">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-white/70">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="archived">archived</option>
            <option value="closed">closed</option>
          </select>
        </div>

        <div className="lg:col-span-3 space-y-1">
          <label className="text-xs text-white/70">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[140px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            placeholder="Short summary"
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-white/50">
        Note: Archiving is also available via the Archive button in the case header.
      </div>
    </section>
  );
}
