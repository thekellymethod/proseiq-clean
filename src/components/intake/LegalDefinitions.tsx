"use client";

import React from "react";
import {
  LEGAL_TERMS,
  CLAIMS_BY_CATEGORY,
  AVOID_BY_CASE_TYPE,
  COMMON_MISTAKES,
} from "./legalReferenceData";

type TabId = "terms" | "claims" | "mistakes" | "avoid";

export default function LegalDefinitions() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<TabId>("terms");
  const [search, setSearch] = React.useState("");

  const termsFiltered = Object.entries(LEGAL_TERMS).filter(
    ([k]) => !search || k.toLowerCase().includes(search.toLowerCase()) || LEGAL_TERMS[k].def.toLowerCase().includes(search.toLowerCase())
  );

  const claimsFiltered = CLAIMS_BY_CATEGORY.map((cat) => ({
    ...cat,
    claims: cat.claims.filter(
      (c) => !search || c.toLowerCase().includes(search.toLowerCase()) || cat.category.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.claims.length > 0);

  const mistakesFiltered = COMMON_MISTAKES.filter(
    (m) =>
      !search ||
      m.topic.toLowerCase().includes(search.toLowerCase()) ||
      m.mistake.toLowerCase().includes(search.toLowerCase())
  );

  const avoidFiltered = AVOID_BY_CASE_TYPE.filter(
    (a) =>
      !search ||
      a.caseType.toLowerCase().includes(search.toLowerCase()) ||
      a.avoid.some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm text-white/80 hover:text-white"
      >
        <span>Legal reference: terms, claims, mistakes & things to avoid</span>
        <span className="text-white/50">{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-white outline-none"
          />
          <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2">
            {(["terms", "claims", "mistakes", "avoid"] as TabId[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded px-2 py-1 text-xs capitalize ${
                  tab === t ? "bg-amber-300/20 text-amber-100" : "text-white/60 hover:text-white"
                }`}
              >
                {t === "avoid" ? "Things to avoid" : t}
              </button>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto text-xs">
            {tab === "terms" && (
              <div className="space-y-2">
                {termsFiltered.map(([term, { def, example, mistake, misperception }]) => (
                  <div key={term} className="rounded border border-white/5 bg-black/10 p-2">
                    <div className="font-medium capitalize text-white/90">{term.replace(/-/g, " ")}</div>
                    <div className="mt-0.5 text-white/60">{def}</div>
                    {example && <div className="mt-1 text-white/40">{example}</div>}
                    {mistake && (
                      <div className="mt-1 rounded border-l-2 border-amber-500/50 bg-amber-500/5 pl-2 text-amber-200/80">
                        <span className="font-medium">Common mistake:</span> {mistake}
                      </div>
                    )}
                    {misperception && (
                      <div className="mt-0.5 rounded border-l-2 border-rose-500/50 bg-rose-500/5 pl-2 text-rose-200/80">
                        <span className="font-medium">Misperception:</span> {misperception}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {tab === "claims" && (
              <div className="space-y-3">
                {claimsFiltered.map(({ category, claims }) => (
                  <div key={category} className="space-y-1">
                    <div className="font-semibold text-white/90">{category}</div>
                    <div className="flex flex-wrap gap-1">
                      {claims.map((c) => (
                        <span
                          key={c}
                          className="rounded bg-white/5 px-1.5 py-0.5 text-white/60"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === "mistakes" && (
              <div className="space-y-2">
                {mistakesFiltered.map((m, i) => (
                  <div key={i} className="rounded border border-white/5 bg-black/10 p-2">
                    <div className="font-medium text-white/90">{m.topic}</div>
                    <div className="mt-0.5 text-rose-200/80">
                      <span className="font-medium">Mistake:</span> {m.mistake}
                    </div>
                    <div className="mt-0.5 text-emerald-200/80">
                      <span className="font-medium">Correction:</span> {m.correction}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === "avoid" && (
              <div className="space-y-2">
                {avoidFiltered.map((a) => (
                  <div key={a.caseType} className="rounded border border-white/5 bg-black/10 p-2">
                    <div className="font-medium text-white/90">{a.caseType}</div>
                    <div className="mt-1 space-y-0.5">
                      {a.avoid.map((v, i) => (
                        <div key={i} className="flex items-start gap-1 text-white/60">
                          <span className="text-rose-400/80">•</span>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
