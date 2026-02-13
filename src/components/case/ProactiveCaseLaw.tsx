"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    high: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  };

  const addToCaseLibrary = (suggestion: Suggestion) => {
    // Uses local state for now; can be wired to case_ai_outputs or dedicated case_law table later.
    setPinned((p) => {
      if (p.some((x) => x.citation === suggestion.citation)) return p;
      return [...p, suggestion];
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI-Suggested Case Law
          </CardTitle>
          <Button variant="outline" size="sm" onClick={generateSuggestions} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error ? (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {loading && !suggestions ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Analyzing case and researching relevant precedents...</p>
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h4 className="font-semibold text-slate-900 text-sm">{suggestion.citation}</h4>
                      <Badge className={strengthColors[suggestion.strength?.toLowerCase() || "medium"]}>
                        {suggestion.strength}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">
                      <span className="font-medium">Holding:</span> {suggestion.holding}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Relevance:</span> {suggestion.relevance}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addToCaseLibrary(suggestion)}
                    className="flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}

            {pinned.length > 0 ? (
              <div className="pt-2">
                <div className="text-xs font-medium text-slate-600 mb-2">Pinned (session)</div>
                <ul className="space-y-1">
                  {pinned.map((p, idx) => (
                    <li key={idx} className="text-xs text-slate-700">
                      {p.citation}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">No suggestions available</p>
        )}
      </CardContent>
    </Card>
  );
}
