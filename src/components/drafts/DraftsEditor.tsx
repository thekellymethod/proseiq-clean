"use client";

import React from "react";
import Link from "next/link";

type Draft = {
  id: string;
  case_id: string;
  title: string;
  kind: string;
  content: string;
  updated_at: string;
};

type Version = {
  id: string;
  created_at: string;
};

export default function DraftEditor({ draftId }: { draftId: string }) {
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [versions, setVersions] = React.useState<Version[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function load() {
    const res = await fetch(`/api/drafts/${draftId}`, { cache: "no-store" });
    const j = await res.json();
    setDraft(j.item);

    const vr = await fetch(`/api/drafts/${draftId}/versions`, { cache: "no-store" });
    const vj = await vr.json();
    setVersions(vj.items ?? []);
  }

  React.useEffect(() => {
    load();
  }, [draftId]);

  // autosave debounce
  React.useEffect(() => {
    if (!draft) return;
    const t = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.title, kind: draft.kind, content: draft.content }),
      });
      setSaving(false);
    }, 800);
    return () => clearTimeout(t);
  }, [draft?.title, draft?.kind, draft?.content, draftId]);

  async function snapshot() {
    setBusy(true);
    await fetch(`/api/drafts/${draftId}`, { method: "POST" });
    await load();
    setBusy(false);
  }

  async function restore(versionId: string) {
    setBusy(true);
    const res = await fetch(`/api/drafts/${draftId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    const j = await res.json();
    setDraft(j.item);
    await load();
    setBusy(false);
  }

  async function del() {
    if (!confirm("Delete this draft?")) return;
    setBusy(true);
    await fetch(`/api/drafts/${draftId}`, { method: "DELETE" });
    setBusy(false);
    // nothing else to do; user can navigate back manually
  }

  if (!draft) return <div className="text-white/70">Loading…</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Link
              href={`/dashboard/cases/${draft.case_id}/drafts`}
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              <div className="flex gap-2">
  <Link
    href={`/dashboard/cases/${draft.case_id}/drafts`}
    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
  >
    Back
  </Link>

  <button
    disabled={busy}
    onClick={snapshot}
    className="rounded border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
  >
    Snapshot
  </button>

  <a
    href={`/api/drafts/${draftId}/export/pdf`}
    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
  >
    Export PDF
  </a>

  <a
    href={`/api/drafts/${draftId}/export/html`}
    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
  >
    Export HTML
  </a>

  <button
    disabled={busy}
    onClick={del}
    className="rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100 hover:bg-red-500/15 disabled:opacity-60"
  >
    <a
  href={`/api/drafts/${draftId}/export/docx`}
  className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
>
  Export DOCX
</a>

    Delete
  </button>
</div>
<a
  href={`/api/cases/${draft.case_id}/bundle?draftId=${draftId}`}
  className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
>
  Bundle ZIP (Draft + Exhibits)
</a>
<a
  href={`/api/drafts/${draftId}/export/html`}
  target="_blank"
  rel="noopener noreferrer"
  className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
>
<a
  href={`/api/cases/${draft.case_id}/bundle?draftId=${draftId}&prefix=PROSEIQ&batesStart=1&batesWidth=6`}
  className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
>
  Bundle ZIP (Draft + Exhibits)
</a>

  Print View
</a>

          <div className="text-xs text-white/60">
            {saving ? "Saving…" : `Updated: ${new Date(draft.updated_at).toLocaleString()}`}
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="rounded bg-black/20 p-2 text-white placeholder:text-white/40"
            placeholder="Title"
          />
          <select
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            className="rounded bg-black/20 p-2 text-white"
          >
            <option value="narrative">narrative</option>
            <option value="demand_letter">demand_letter</option>
            <option value="petition">petition</option>
            <option value="motion">motion</option>
            <option value="memo">memo</option>
            <option value="notes">notes</option>
          </select>
          <div className="rounded bg-black/10 p-2 text-xs text-white/60">
            Draft ID: {draft.id.slice(0, 8)}
          </div>
        </div>

        <textarea
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          className="min-h-[520px] w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white"
          placeholder="Write here…"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-white font-medium">Versions</div>
        <div className="mt-3 space-y-2">
          {versions.length === 0 ? (
            <div className="text-sm text-white/60">No snapshots yet.</div>
          ) : (
            versions.map((v) => (
              <button
                key={v.id}
                disabled={busy}
                onClick={() => restore(v.id)}
                className="w-full rounded border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white/80 hover:bg-black/30 disabled:opacity-60"
              >
                {new Date(v.created_at).toLocaleString()}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
