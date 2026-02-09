//src/components/case/CaseLawSection.tsx
"use client";

import React from "react";

type ResearchHit = {
  id: string;
  pinned?: boolean;
  title: string;
  url: string;
  citation: string;
  quotedText?: string;
  summary: string;
  whyRelevant: string;
  relevanceScore: number;
  strength: "high" | "medium" | "low";
  confidence: number;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseLawSection({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [jurisdiction, setJurisdiction] = React.useState("");
  const [hits, setHits] = React.useState<ResearchHit[]>([]);
  const [pinned, setPinned] = React.useState<ResearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function jsonFetch(url: string, init?: RequestInit) {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
    return j;
  }

  async function loadPinned() {
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/research/pin`, { method: "GET" });
      setPinned((j.items ?? []) as ResearchHit[]);
    } catch {
      // non-fatal
    }
  }

  React.useEffect(() => {
    loadPinned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function search() {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/research/search`, {
        method: "POST",
        body: JSON.stringify({ query: q, jurisdiction: jurisdiction.trim() || undefined, limit: 6 }),
      });
      setHits((j.hits ?? []) as ResearchHit[]);
    } finally {
      setLoading(false);
    }
  }

  async function togglePin(h: ResearchHit, nextPinned: boolean) {
    setError(null);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/research/pin`, {
        method: "POST",
        body: JSON.stringify({ outputId: h.id, pinned: nextPinned }),
      });
      const item: ResearchHit = j.item;
      setHits((p) => p.map((x) => (x.id === item.id ? { ...x, pinned: item.pinned } : x)));
      await loadPinned();
    } catch (e: any) {
      setError(e?.message ?? "Failed to pin");
    }
  }

  const strengthPill = (s: string) => {
    const base = "rounded-full border px-2 py-1 text-[11px] font-medium";
    if (s === "high") return `${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-100`;
    if (s === "low") return `${base} border-white/15 bg-white/5 text-white/70`;
    return `${base} border-amber-300/30 bg-amber-300/10 text-amber-50`;
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Legal research</h3>
        <p className="text-sm text-white/70">
          Search the web with citations, then pin authority into your case.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-1">
          <label className="text-xs text-white/70">Query</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "w-full rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
            placeholder="e.g., landlord tenant retaliation elements notice timeline"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/70">Jurisdiction (optional)</label>
          <input
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            disabled={!!readOnly}
            className={cx(
              "w-full rounded-md border px-3 py-2 text-sm",
              "border-white/10 bg-black/20 text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
              readOnly && "opacity-60"
            )}
            placeholder="e.g., Texas, California, US Federal"
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={search}
          disabled={!!readOnly || loading}
          className={cx(
            "rounded-md px-3 py-2 text-sm font-medium",
            "border border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/15",
            (readOnly || loading) && "opacity-60"
          )}
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button
          onClick={loadPinned}
          disabled={loading}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
        >
          Refresh pinned
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {hits.length === 0 ? (
            <div className="text-sm text-white/70">No results yet.</div>
          ) : (
            <ul className="space-y-2">
              {hits.map((h) => (
                <li key={h.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-amber-100">{h.citation}</div>
                        <span className={strengthPill(h.strength)}>{h.strength}</span>
                        <span className="text-xs text-white/50">Score: {h.relevanceScore}</span>
                        <span className="text-xs text-white/50">Conf: {Math.round(h.confidence * 100)}%</span>
                      </div>
                      <a href={h.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-sky-200/90 hover:text-sky-200">
                        {h.title}
                      </a>
                      {h.quotedText ? (
                        <div className="mt-2 rounded border border-white/10 bg-black/20 p-2 text-xs text-white/70">
                          “{h.quotedText}”
                        </div>
                      ) : null}
                      <div className="mt-2 text-sm text-white/80">
                        <span className="text-white/60">Summary: </span>
                        {h.summary}
                      </div>
                      <div className="mt-2 text-sm text-white/80">
                        <span className="text-white/60">Why relevant: </span>
                        {h.whyRelevant}
                      </div>
                    </div>

                    <button
                      disabled={!!readOnly}
                      onClick={() => togglePin(h, !h.pinned)}
                      className={cx(
                        "shrink-0 rounded-md border px-2 py-1 text-xs",
                        h.pinned
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
                          : "border-white/10 bg-black/20 text-white/70 hover:bg-black/30",
                        readOnly && "opacity-60"
                      )}
                    >
                      {h.pinned ? "Pinned" : "Pin"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="rounded-xl border border-white/10 bg-black/10 p-3">
          <div className="text-sm font-medium text-white">Pinned authority</div>
          <div className="mt-1 text-xs text-white/60">Use pinned items in motions and analysis.</div>
          <div className="mt-3 space-y-2">
            {pinned.length === 0 ? (
              <div className="text-sm text-white/60">Nothing pinned yet.</div>
            ) : (
              pinned.map((p) => (
                <div key={p.id} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="truncate text-xs font-medium text-amber-100">{p.citation}</div>
                  <a href={p.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[11px] text-sky-200/90 hover:text-sky-200">
                    {p.title}
                  </a>
                  <button
                    onClick={() => togglePin(p, false)}
                    className="mt-2 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white/70 hover:bg-black/30"
                  >
                    Unpin
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <div className="mt-3 text-xs text-white/50">
        Case: <span className="text-white/70">{caseId}</span>
      </div>
    </section>
  );
}
