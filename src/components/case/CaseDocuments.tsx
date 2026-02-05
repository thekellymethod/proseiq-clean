//src/components/case/CaseDocuments.tsx
"use client";

import React from "react";

type FileRow = {
  id: string;
  filename: string;
  mime: string | null;
  size: number | null;
  status: string;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function fmtBytes(n?: number | null) {
  if (!n) return "—";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function CaseDocuments({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<FileRow[]>([]);
  const [busy, setBusy] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function load() {
    const r = await fetch(`/api/cases/${caseId}/files`, { cache: "no-store" });
    const j = await r.json();
    setItems(j.items ?? []);
  }

  React.useEffect(() => {
    load();
  }, [caseId]);

  async function download(fileId: string) {
    const r = await fetch(`/api/files/${fileId}/download-url`, { cache: "no-store" });
    const j = await r.json();
    if (j.url) window.open(j.url, "_blank", "noopener,noreferrer");
  }

  async function update(fileId: string, patch: any) {
    await fetch(`/api/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function remove(fileId: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    await load();
  }

  async function uploadSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);

    try {
      for (const f of Array.from(files)) {
        // 1) Create DB row
        const created = await fetch(`/api/cases/${caseId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: f.name, mime: f.type || null, size: f.size, tags: [], status: "draft" }),
        }).then((r) => r.json());

        const row = created.item;
        if (!row?.id) continue;

        // 2) Get signed upload url
        const signed = await fetch(`/api/files/${row.id}/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: f.type || "application/octet-stream" }),
        }).then((r) => r.json());

        if (!signed?.url) continue;

        // 3) Upload bytes to signed URL
        const up = await fetch(signed.url, {
          method: "PUT",
          headers: { "Content-Type": f.type || "application/octet-stream" },
          body: f,
        });

        if (!up.ok) {
          // mark rejected or keep draft
          await update(row.id, { status: "rejected", notes: `Upload failed: ${up.status}` });
        } else {
          await update(row.id, { status: "pending_review" });
        }
      }
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Documents</h3>
          <p className="text-sm text-white/70">Secure storage, statuses, tags, and signed downloads.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => uploadSelected(e.target.files)}
            className="hidden"
            data-testid="file-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
            data-testid="upload-button"
          >
            Upload
          </button>

          <button
            onClick={load}
            className="rounded-md border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/80 hover:bg-black/20"
            data-testid="refresh-files"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">No documents yet.</div>
        ) : (
          items.map((f) => (
            <div key={f.id} className="rounded-lg border border-white/10 bg-black/10 p-3" data-testid={`file-row-${f.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{f.filename}</div>
                  <div className="mt-1 text-xs text-white/60">
                    {f.mime ?? "—"} • {fmtBytes(f.size)} • Updated {new Date(f.updated_at).toLocaleString()}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={f.status}
                      onChange={(e) => update(f.id, { status: e.target.value })}
                      className="rounded bg-black/20 px-2 py-1 text-xs text-white"
                      data-testid={`file-status-${f.id}`}
                    >
                      <option value="draft">draft</option>
                      <option value="pending_review">pending_review</option>
                      <option value="approved">approved</option>
                      <option value="filed">filed</option>
                      <option value="sent">sent</option>
                      <option value="archived">archived</option>
                      <option value="rejected">rejected</option>
                    </select>

                    <input
                      value={(f.tags ?? []).join(", ")}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setItems((prev) => prev.map((x) => (x.id === f.id ? { ...x, tags } : x)));
                      }}
                      onBlur={() => update(f.id, { tags: f.tags })}
                      placeholder="tags (comma separated)"
                      className="min-w-[220px] flex-1 rounded bg-black/20 px-2 py-1 text-xs text-white placeholder:text-white/40"
                      data-testid={`file-tags-${f.id}`}
                    />
                  </div>

                  <textarea
                    value={f.notes ?? ""}
                    onChange={(e) =>
                      setItems((prev) => prev.map((x) => (x.id === f.id ? { ...x, notes: e.target.value } : x)))
                    }
                    onBlur={() => update(f.id, { notes: f.notes })}
                    placeholder="notes"
                    className="mt-2 w-full rounded bg-black/20 p-2 text-xs text-white placeholder:text-white/40"
                    data-testid={`file-notes-${f.id}`}
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => download(f.id)}
                    className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    data-testid={`file-download-${f.id}`}
                  >
                    Download
                  </button>

                  <button
                    onClick={() => remove(f.id)}
                    className="rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100 hover:bg-red-500/15"
                    data-testid={`file-delete-${f.id}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
