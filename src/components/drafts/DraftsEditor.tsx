"use client";

import React from "react";

type Draft = {
  id: string;
  case_id: string;
  title: string;
  content: string | null;
  status: string | null;
  updated_at: string;
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

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DraftsEditor({
  caseId,
  draftId,
}: {
  caseId: string;
  draftId: string;
}) {
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [status, setStatus] = React.useState("draft");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/drafts/${draftId}`, { method: "GET" });
      const d: Draft = j.item;
      setDraft(d);
      setTitle(d.title ?? "");
      setContent(d.content ?? "");
      setStatus((d.status ?? "draft") as any);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }, [caseId, draftId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setError(null);
    setOk(null);
    setSaving(true);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/drafts/${draftId}`, {
        method: "PATCH",
        body: JSON.stringify({
          patch: {
            title: title.trim() || "Untitled draft",
            content,
            status,
          },
        }),
      });
      setDraft(j.item ?? null);
      setOk("Saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
      setTimeout(() => setOk(null), 1200);
    }
  }

  const pdfHref = `/api/cases/${caseId}/drafts/${draftId}/export/pdf`;
  const docxHref = `/api/cases/${caseId}/drafts/${draftId}/export/docx`;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Draft editor</h3>
          <p className="text-sm text-white/70">
            Keep it simple for MVP: edit, save, export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={pdfHref}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
          >
            Export PDF
          </a>
          <a
            href={docxHref}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
          >
            Export DOCX
          </a>
          <button
            onClick={save}
            disabled={saving || loading}
            className={cx(
              "rounded-md border px-3 py-2 text-sm font-medium",
              "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
              (saving || loading) && "opacity-60"
            )}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 text-sm text-white/60">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs text-white/70">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="Untitled draft"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="draft">draft</option>
                <option value="final">final</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70">Body</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[420px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              placeholder="Write here…"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/55">
            <div>
              Updated: {fmt(draft?.updated_at)} • Created: {fmt(draft?.created_at)}
            </div>
            <button
              onClick={load}
              className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
