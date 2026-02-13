"use client";

import React from "react";
import { Sparkles, BookOpen, Loader2, Plus, RefreshCw } from "lucide-react";

type CaseData = {
  id: string;
  title?: string;
  case_type?: string;
  status?: string;
  our_position?: string;
  key_facts?: string[];
  legal_issues?: string[];
  description?: string;
};

type Suggestion = {
  citation?: string;
  holding?: string;
  relevance?: string;
  strength?: string;
};

export default function ProactiveCaseLaw({ caseData }: { caseData: CaseData }) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pinned, setPinned] = React.useState<Suggestion[]>([]);

  const generateSuggestions = async () => {
    setLoading(true);
    setError(null);

    const prompt = `Based on this case information, suggest 5 highly relevant legal precedents and case law:

CASE: ${caseData.title}
TYPE: ${caseData.case_type}
STATUS: ${caseData.status}
POSITION: ${caseData.our_position || "Not specified"}
KEY FACTS: ${caseData.key_facts?.join(", ") || "None listed"}
LEGAL ISSUES: ${caseData.legal_issues?.join(", ") || "None listed"}
DESCRIPTION: ${caseData.description || "N/A"}

Provide 5 relevant case law suggestions with:
- Full citation
- Brief summary of holding
- Why it's relevant to this case
- Strength of relevance (high/medium/low)`;

    try {
      const res = await fetch(`/api/cases/${caseData.id}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          json: true,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((j as { error?: string })?.error || `Request failed (${res.status})`);

      const result = (j as { json?: { suggestions?: Suggestion[] } })?.json || {};
      setSuggestions(result.suggestions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate suggestions.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateSuggestions();
  }, []);

  const strengthColors: Record<string, string> = {
    high: "bg-emerald-500/20 text-emerald-200",
    medium: "bg-amber-500/20 text-amber-200",
    low: "bg-white/10 text-white/60",
  };

  const addToCaseLibrary = (suggestion: Suggestion) => {
    // Uses local state for now; can be wired to case_ai_outputs or dedicated case_law table later.
    setPinned((p) => {
      if (p.some((x) => x.citation === suggestion.citation)) return p;
      return [...p, suggestion];
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          AI-Suggested Case Law
        </h3>
        <button
          type="button"
          onClick={generateSuggestions}
          disabled={loading}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white/80 hover:bg-black/30 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="p-4">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
        {loading && !suggestions ? (
          <div className="text-center py-8 text-white/60">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Analyzing case and researching relevant precedents...</p>
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <h4 className="font-semibold text-white text-sm">{suggestion.citation}</h4>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${strengthColors[suggestion.strength?.toLowerCase() || "medium"]}`}
                      >
                        {suggestion.strength}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">
                      <span className="font-medium">Holding:</span> {suggestion.holding}
                    </p>
                    <p className="text-sm text-white/60">
                      <span className="font-medium">Relevance:</span> {suggestion.relevance}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCaseLibrary(suggestion)}
                    className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/80 hover:bg-black/30"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add
                  </button>
                </div>
              </div>
            ))}

            {pinned.length > 0 ? (
              <div className="pt-2">
                <div className="text-xs font-medium text-white/60 mb-2">Pinned (session)</div>
                <ul className="space-y-1">
                  {pinned.map((p, idx) => (
                    <li key={idx} className="text-xs text-white/70">
                      {p.citation}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-white/60 py-4">No suggestions available</p>
        )}
      </div>
    </div>
  );
}
