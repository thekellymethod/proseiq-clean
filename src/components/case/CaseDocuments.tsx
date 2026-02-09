
"use client";

import React from "react";

type DocRow = {
  id: string;
  filename: string;
  mime_type: string | null;
  byte_size: number | null;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
  kind?: string | null;
  status?: string;
};

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function fmtBytes(n: number | null) {
  if (!n && n !== 0) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let x = n;
  let i = 0;
  while (x >= 1024 && i < u.length - 1) {
    x /= 1024;
    i++;
  }
  return `${x.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function CaseDocuments({ params }: { params: { caseId: string } }) {
  const { caseId } = params;
  const [items, setItems] = React.useState<DocRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/documents`, { method: "GET" });
      setItems(j.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function uploadOne(file: File) {
    setError(null);
    setUploading(true);
    try {
      const up = await jsonFetch(`/api/cases/${caseId}/documents/upload`, {
        method: "POST",
        body: JSON.stringify({ filename: file.name, mime_type: file.type || "application/octet-stream", byte_size: file.size }),
      });

      const putRes = await fetch(up.upload?.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!putRes.ok) {
        const t = await putRes.text().catch(() => "");
        throw new Error(`Upload failed (${putRes.status}): ${t.slice(0, 200)}`);
      }

      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function download(docId: string) {
    setError(null);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/documents/${docId}/signed-url`, { method: "GET" });
      const url = String(j.signedUrl ?? "");
      if (!url) throw new Error("Missing signedUrl");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  }

  async function remove(docId: string) {
    setError(null);
    try {
      await jsonFetch(`/api/cases/${caseId}/documents/${docId}`, { method: "DELETE" });
      setItems((p) => p.filter((x) => x.id !== docId));
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Documents</h3>
          <p className="text-sm text-white/70">Upload evidence files and link them to exhibits, events, and drafts.</p>
        </div>

        <div className="flex gap-2">
          <label className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 cursor-pointer">
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadOne(f);
                e.currentTarget.value = "";
              }}
              disabled={uploading}
            />
          </label>

          <button onClick={refresh} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30">
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
      ) : null}

      {loading ? (
        <div className="mt-3 text-sm text-white/60">Loading…</div>
      ) : items.length === 0 ? (
        <div className="mt-3 text-sm text-white/60">No documents yet.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((d) => (
            <div key={d.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{d.filename}</div>
                  <div className="mt-1 text-xs text-white/60">
                    {fmtBytes(d.byte_size)} • {d.mime_type || "unknown"} • {fmtDate(d.created_at)}
                  </div>
                  <div className="mt-2 text-xs text-white/50 font-mono truncate">{d.storage_path}</div>
                </div>

                <div className="shrink-0 flex gap-2">
                  <button onClick={() => download(d.id)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10">
                    Download
                  </button>
                  <button onClick={() => remove(d.id)} className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
