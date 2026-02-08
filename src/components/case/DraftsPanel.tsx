//src/components/case/DraftsPanel.tsx
"use client";

import React from "react";
import Link from "next/link";

type DraftRow = {
  id: string;
  title: string;
  kind: string;
  updated_at: string;
};

export default function DraftsPanel({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<DraftRow[]>([]);
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState("narrative");
  const [busy, setBusy] = React.useState(false);

  async function load() {
    const res = await fetch(`/api/cases/${caseId}/drafts`, { cache: "no-store" });
    const j = await res.json();
    setItems(j.items ?? []);
  }

  React.useEffect(() => {
    load();
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function create() {
    if (!title.trim()) return;
    setBusy(true);
    await fetch(`/api/cases/${caseId}/drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, kind }),
    });
    setTitle("");
    setBusy(false);
    await load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No drafts yet.</div>
        ) : (
          items.map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/drafts/${d.id}`}
              className="block rounded-lg border border-white/10 bg-black/20 p-3 hover:bg-black/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{d.title}</div>
                  <div className="text-xs text-white/60">{d.kind}</div>
                </div>
                <div className="shrink-0 text-xs text-white/60">{new Date(d.updated_at).toLocaleString()}</div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
        <div className="text-white font-medium">New Draft</div>
        <div className="mt-3 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Draft title"
            className="w-full rounded bg-black/20 p-2 text-white placeholder:text-white/40"
          />
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full rounded bg-black/20 p-2 text-white">
            <option value="narrative">narrative</option>
            <option value="demand_letter">demand_letter</option>
            <option value="petition">petition</option>
            <option value="motion">motion</option>
            <option value="memo">memo</option>
            <option value="notes">notes</option>
          </select>
          <button disabled={busy} onClick={create} className="w-full rounded bg-amber-300/20 p-2 text-amber-100 disabled:opacity-60">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
