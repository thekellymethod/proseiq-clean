"use client";

import React from "react";
import Link from "next/link";

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

export default function DocumentViewer({ caseId, docId }: { caseId: string; docId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [signedUrl, setSignedUrl] = React.useState<string>("");
  const [filename, setFilename] = React.useState<string>("");
  const [mimeType, setMimeType] = React.useState<string>("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const j = await jsonFetch(`/api/cases/${caseId}/documents/${docId}/signed-url`);
        if (!alive) return;
        setSignedUrl(String(j.signedUrl ?? ""));
        setFilename(String(j.item?.filename ?? ""));
        setMimeType(String(j.item?.mime_type ?? ""));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load document");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [caseId, docId]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-white/70">Document</div>
          <div className="truncate text-white font-semibold">{filename || docId}</div>
          <div className="mt-1 text-xs text-white/60">{mimeType || "unknown"}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/cases/${caseId}/documents`}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
          >
            Back
          </Link>
          <a
            href={`/api/cases/${caseId}/documents/${docId}/download`}
            className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
          >
            Download
          </a>
          {signedUrl ? (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Open
            </a>
          ) : null}
        </div>
      </div>

      {error ? <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}
      {loading ? <div className="mt-3 text-sm text-white/60">Loading…</div> : null}

      {!loading && !error && signedUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          {/* In-app PDF viewer (works for PDFs; other file types fall back to browser viewer) */}
          <iframe
            title="Document viewer"
            src={signedUrl}
            className="h-[75vh] w-full min-h-[400px]"
            sandbox="allow-same-origin allow-scripts"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}
    </section>
  );
}

