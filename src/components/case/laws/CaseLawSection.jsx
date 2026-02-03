"use client";

import React from "react";



function cx(...s) {
  return s.filter(Boolean).join(" ");
}

export default function CaseLawSection({ caseId, readOnly }) {
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function search() {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    try {
      // TODO: POST /api/cases/[caseId]/caselaw/search  { query: q }
      // Placeholder deterministic “hits”
      setHits([
        {
          id: "h1",
          citation: "Tex. Bus. & Com. Code § 17.50 (DTPA remedies)",
          holding: "Consumer may recover economic damages; treble damages for knowing conduct.",
          relevance: "Damages theory and notice strategy; settlement leverage.",
        },
        {
          id: "h2",
          citation: "UCC Art. 9 (commercial reasonableness)",
          holding: "Disposition of collateral must be commercially reasonable; defects can reduce/eliminate deficiency.",
          relevance: "Attacks the deficiency balance; supports declaratory relief and offsets.",
        },
      ]);
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
          placeholder="e.g., Texas repossession notice deficiency commercially unreasonable sale"
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
            {hits.map((h) => (
              <li key={h.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                <div className="font-medium text-amber-100">{h.citation}</div>
                <div className="mt-2 text-sm text-white/80">
                  <span className="text-white/60">Holding: </span>
                  {h.holding}
                </div>
                <div className="mt-2 text-sm text-white/80">
                  <span className="text-white/60">Relevance: </span>
                  {h.relevance}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 text-xs text-white/50">
        Case: <span className="text-white/70">{caseId}</span>
      </div>
    </section>
  );
}
