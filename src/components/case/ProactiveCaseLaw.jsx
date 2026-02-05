//src/components/case/ProactiveCaseLaw.jsx
import React, { useState, useEffect } from 'react';
import { tsx } from '@/api/tsxClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Loader2, Plus, RefreshCw } from 'lucide-react';

export default function ProactiveCaseLaw({ caseData }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);

    const prompt = `Based on this case information, suggest 5 highly relevant legal precedents and case law:

CASE: ${caseData.title}
TYPE: ${caseData.case_type}
STATUS: ${caseData.status}
POSITION: ${caseData.our_position || 'Not specified'}
KEY FACTS: ${caseData.key_facts?.join(', ') || 'None listed'}
LEGAL ISSUES: ${caseData.legal_issues?.join(', ') || 'None listed'}
DESCRIPTION: ${caseData.description || 'N/A'}

Provide 5 relevant case law suggestions with:
- Full citation
- Brief summary of holding
- Why it's relevant to this case
- Strength of relevance (high/medium/low)`;

    const result = await tsx.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                citation: { type: 'string' },
                holding: { type: 'string' },
                relevance: { type: 'string' },
                strength: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setSuggestions(result.suggestions);
    setLoading(false);
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  const strengthColors = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-600'
  };

  const addToCaseLibrary = async (suggestion) => {
    await tsx.entities.CaseLaw.create({
      case_id: caseData.id,
      citation: suggestion.citation,
      case_name: suggestion.citation.split(',')[0],
      holding: suggestion.holding,
      relevance: suggestion.relevance
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading && !suggestions ? (
          <div className="text-center py-8 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Analyzing case and researching relevant precedents...</p>
          </div>
        ) : suggestions?.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h4 className="font-semibold text-slate-900 text-sm">{suggestion.citation}</h4>
                      <Badge className={strengthColors[suggestion.strength?.toLowerCase() || 'medium']}>
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
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">No suggestions available</p>
        )}
      </CardContent>
    </Card>
  );
}