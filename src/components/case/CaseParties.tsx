"use client";

import React from "react";

type PartyRow = {
  id: string;
  case_id: string;
  role: string;
  name: string;
  notes: string | null;
  created_at: string;
};

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function CaseParties({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<PartyRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const [role, setRole] = React.useState("other");
  const [name, setName] = React.useState("");
  const [notes, setNotes] = React.useState("");

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/parties`, { method: "GET" });
      setItems(j.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load parties");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await jsonFetch(`/api/cases/${caseId}/parties`, {
        method: "POST",
        body: JSON.stringify({
          role,
          name: name.trim(),
          notes: notes.trim() || null,
        }),
      });
      setName("");
      setNotes("");
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create party");
    } finally {
      setBusy(false);
    }
  }

  async function remove(partyId: string) {
    setBusy(true);
    setError(null);
    try {
      await jsonFetch(`/api/cases/${caseId}/parties?party_id=${encodeURIComponent(partyId)}`, { method: "DELETE" });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete party");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
        <div className="text-white font-medium">Add party</div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded bg-black/20 p-2 text-white">
            <option value="plaintiff">plaintiff</option>
            <option value="defendant">defendant</option>
            <option value="witness">witness</option>
            <option value="other">other</option>
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded bg-black/20 p-2 text-white placeholder:text-white/40"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="rounded bg-black/20 p-2 text-white placeholder:text-white/40"
          />
        </div>
        <div className="mt-3">
          <button
            disabled={busy || !name.trim()}
            onClick={create}
            className="rounded bg-amber-300/20 px-3 py-2 text-amber-100 disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
        <div className="text-white font-medium">Parties</div>
        {loading ? (
          <div className="mt-2 text-sm text-white/60">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-2 text-sm text-white/60">No parties yet.</div>
        ) : (
          <div className="mt-3 divide-y divide-white/10">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">
                    <span className="text-white/60">{p.role}</span> · {p.name}
                  </div>
                  <div className="truncate text-xs text-white/60">
                    {p.notes ? p.notes : "—"} · {fmtDate(p.created_at)}
                  </div>
                </div>
                <button
                  disabled={busy}
                  onClick={() => remove(p.id)}
                  className="rounded bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseParties;

