"use client";

import React from "react";

type Exhibit = {
  id: string;
  case_id: string;
  exhibit_no: number;
  label: string;
  title: string;
  description: string | null;
  proof_notes: string | null;
  source: string | null;
  file_path: string | null;
  url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type Bundle = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  include_bates: boolean;
  bates_prefix: string | null;
  bates_start: number | null;
  output_path: string | null;
  error: string | null;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function CaseExhibits({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<Exhibit[]>([]);
  const [bundles, setBundles] = React.useState<Bundle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [proofNotes, setProofNotes] = React.useState("");
  const [source, setSource] = React.useState("document");
  const [url, setUrl] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [bundleTitle, setBundleTitle] = React.useState("Exhibit Packet");
  const [includeBates, setIncludeBates] = React.useState(false);
  const [batesPrefix, setBatesPrefix] = React.useState("C-");
  const [batesStart, setBatesStart] = React.useState("1");
  const [queueing, setQueueing] = React.useState(false);

  async function refreshAll() {
    setError(null);
    setLoading(true);
    try {
      const [ex, bu] = await Promise.all([
        jsonFetch(`/api/cases/${caseId}/exhibits`, { method: "GET" }),
        jsonFetch(`/api/cases/${caseId}/bundles`, { method: "GET" }),
      ]);
      setItems(ex.items ?? []);
      setBundles(bu.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setProofNotes("");
    setSource("document");
    setUrl("");
    setEditingId(null);
  }

  function loadForEdit(e: Exhibit) {
    setEditingId(e.id);
    setTitle(e.title || "");
    setDescription(e.description ?? "");
    setProofNotes(e.proof_notes ?? "");
    setSource(e.source ?? "document");
    setUrl(e.url ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    setError(null);
    const t = title.trim();
    if (!t) return setError("Title is required.");
    setSaving(true);
    try {
      if (!editingId) {
        await jsonFetch(`/api/cases/${caseId}/exhibits`, {
          method: "POST",
          body: JSON.stringify({
            title: t,
            description: description.trim() || null,
            proof_notes: proofNotes.trim() || null,
            source: source.trim() || null,
            url: url.trim() || null,
          }),
        });
      } else {
        await jsonFetch(`/api/cases/${caseId}/exhibits`, {
          method: "PATCH",
          body: JSON.stringify({
            exhibit_id: editingId,
            patch: {
              title: t,
              description: description.trim() || null,
              proof_notes: proofNotes.trim() || null,
              source: source.trim() || null,
              url: url.trim() || null,
            },
          }),
        });
      }
      resetForm();
      await refreshAll();
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await jsonFetch(`/api/cases/${caseId}/exhibits?exhibit_id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
      setSelected((prev) => {
        const p = { ...prev };
        delete p[id];
        return p;
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  }

  function toggleSelect(id: string) {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  }

  function selectAll() {
    const next: Record<string, boolean> = {};
    for (const it of items) next[it.id] = true;
    setSelected(next);
  }

  function clearAll() {
    setSelected({});
  }

  async function queueBundle() {
    setError(null);
    const exhibit_ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!exhibit_ids.length) return setError("Select at least one exhibit.");
    setQueueing(true);
    try {
      await jsonFetch(`/api/cases/${caseId}/bundles`, {
        method: "POST",
        body: JSON.stringify({
          title: bundleTitle.trim() || "Exhibit Packet",
          kind: "exhibits",
          include_bates: includeBates,
          bates_prefix: includeBates ? (batesPrefix.trim() || null) : null,
          bates_start: includeBates ? Number(batesStart || "1") : null,
          exhibit_ids,
        }),
      });
      setBundleTitle("Exhibit Packet");
      setIncludeBates(false);
      setBatesPrefix("C-");
      setBatesStart("1");
      await refreshAll();
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setQueueing(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Exhibits</h3>
          <p className="text-sm text-white/70">
            Your persuasion spine: every claim should point to one or more exhibits. Use proof notes to explain what it proves.
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Ladder */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-white">Exhibit ladder</div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
              >
                Select all
              </button>
              <button
                onClick={clearAll}
                className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
              >
                Clear
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-3 text-sm text-white/60">Loading…</div>
          ) : items.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No exhibits yet.</div>
          ) : (
            <ol className="mt-3 space-y-2">
              {items.map((e) => (
                <li key={e.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!selected[e.id]}
                          onChange={() => toggleSelect(e.id)}
                          className="h-4 w-4 accent-amber-300"
                        />
                        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-50">
                          {e.label}
                        </span>
                        {e.source ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                            {e.source}
                          </span>
                        ) : null}
                        {e.url ? (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-sky-200/80 hover:text-sky-200 underline"
                          >
                            link
                          </a>
                        ) : null}
                      </div>

                      <div className="mt-2 font-medium text-white truncate">{e.title}</div>
                      {e.description ? <div className="mt-1 text-sm text-white/75">{e.description}</div> : null}
                      {e.proof_notes ? (
                        <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white/75">
                          <div className="text-xs font-semibold text-white/60">Proof notes</div>
                          <div className="mt-1 whitespace-pre-wrap">{e.proof_notes}</div>
                        </div>
                      ) : null}

                      <div className="mt-2 text-xs text-white/45">
                        Created {fmt(e.created_at)} • Updated {fmt(e.updated_at)}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => loadForEdit(e)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(e.id)}
                        className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Bundle queue */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-sm font-semibold text-white">Bundle queue</div>
            <div className="mt-1 text-xs text-white/60">
              Queue a packet request. A worker will generate the PDF/ZIP later (export pipeline). For now: records and status.
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-1">
                <label className="text-xs text-white/70">Bundle title</label>
                <input
                  value={bundleTitle}
                  onChange={(e) => setBundleTitle(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                  placeholder="Exhibit Packet"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={queueBundle}
                  disabled={queueing}
                  className="w-full rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
                >
                  {queueing ? "Queueing…" : "Queue bundle"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={includeBates}
                  onChange={(e) => setIncludeBates(e.target.checked)}
                  className="h-4 w-4 accent-amber-300"
                />
                Include Bates (pipeline)
              </label>

              <div className={cx("flex items-center gap-2", !includeBates && "opacity-50")}>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">Prefix</div>
                  <input
                    value={batesPrefix}
                    onChange={(e) => setBatesPrefix(e.target.value)}
                    disabled={!includeBates}
                    className="w-24 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">Start</div>
                  <input
                    value={batesStart}
                    onChange={(e) => setBatesStart(e.target.value)}
                    disabled={!includeBates}
                    className="w-20 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              {bundles.length === 0 ? (
                <div className="text-sm text-white/60">No bundle jobs yet.</div>
              ) : (
                <ol className="space-y-2">
                  {bundles.map((b) => (
                    <li key={b.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{b.title}</div>
                          <div className="mt-1 text-xs text-white/60">
                            {b.status} • {fmt(b.created_at)}
                            {b.include_bates ? " • Bates" : ""}
                          </div>
                          {b.output_path ? (
                            <div className="mt-2 text-xs text-white/70">
                              Output: <span className="font-mono">{b.output_path}</span>
                            </div>
                          ) : null}
                          {b.error ? (
                            <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-100">
                              {b.error}
                            </div>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-xs text-white/50 font-mono">
                          {b.id.slice(0, 8)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Add/edit */}
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-white font-medium">{editingId ? "Edit exhibit" : "Add exhibit"}</h4>
            {editingId ? (
              <button
                onClick={resetForm}
                className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-3 space-y-3">
            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="e.g., Invoice #1043 (roof repair)"
              />
            </Field>

            <Field label="Source type">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="document">document</option>
                <option value="email">email</option>
                <option value="text">text message</option>
                <option value="photo">photo</option>
                <option value="video">video</option>
                <option value="bank">bank record</option>
                <option value="court">court record</option>
                <option value="other">other</option>
              </select>
            </Field>

            <Field label="Description (optional)">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="What is this exhibit? Where did it come from?"
              />
            </Field>

            <Field label="Proof notes (optional)">
              <textarea
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full min-h-[100px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="What does it prove? How does it connect to your claim/defense? What is the key quote/line item?"
              />
            </Field>

            <Field label="Link (optional)">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="https://… (optional)"
              />
            </Field>

            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add exhibit"}
            </button>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
              Next: attach files from Documents and generate signed URLs; then Bates stamping and PDF packet generation.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70">{label}</label>
      {children}
    </div>
  );
}