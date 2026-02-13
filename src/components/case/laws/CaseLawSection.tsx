"use client";

import React from "react";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type Hit = {
  id?: string;
  citation?: string;
  title?: string;
  holding?: string;
  relevance?: string;
  whyRelevant?: string;
  summary?: string;
};

export default function CaseLawSection({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function search() {
    const q = query.trim();
    if (!q) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/caselaw/search`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string })?.error ?? "Search failed");
      setHits((json as { hits?: Hit[] }).hits ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
      setHits([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Case Law</h3>
        <p className="text-sm text-white/70">
          Search and pin authority that supports your claims and defeats defenses.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
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
          placeholder="e.g., notice deficiency commercially unreasonable sale"
        />
        <button
          onClick={search}
          disabled={!!readOnly || loading}
          className={cx(
            "shrink-0 rounded-md px-3 py-2 text-sm font-medium",
            "border border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/15",
            (readOnly || loading) && "opacity-60"
          )}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      <div className="mt-4">
        {hits.length === 0 ? (
          <div className="text-sm text-white/70">No results yet.</div>
        ) : (
          <ul className="space-y-2">
            {hits.map((h, idx) => (
              <li key={h.id ?? idx} className="rounded-lg border border-white/10 bg-black/10 p-3">
                <div className="font-medium text-amber-100">{h.citation ?? h.title ?? "—"}</div>
                {(h.holding ?? h.summary) && (
                  <div className="mt-2 text-sm text-white/80">
                    <span className="text-white/60">Holding: </span>
                    {h.holding ?? h.summary}
                  </div>
                )}
                {(h.relevance ?? h.whyRelevant) && (
                  <div className="mt-2 text-sm text-white/80">
                    <span className="text-white/60">Relevance: </span>
                    {h.relevance ?? h.whyRelevant}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
