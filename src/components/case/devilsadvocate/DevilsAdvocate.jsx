import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Plus,
  Loader2,
  Sparkles,
  Shield,
  Target,
  Lightbulb,
  Trash2
} from 'lucide-react';

export default function DevilsAdvocateSection({ caseId, caseData }) {
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [argument, setArgument] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['devils-advocate', caseId],
    queryFn: () => base44.entities.DevilsAdvocate.filter({ case_id: caseId }, '-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.DevilsAdvocate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['devils-advocate', caseId]);
      setAnalyzeOpen(false);
      setArgument('');
      setAnalysisResult(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DevilsAdvocate.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['devils-advocate', caseId])
  });

  const analyzeArgument = async () => {
    if (!argument.trim()) return;
    setAnalyzing(true);

    const prompt = `You are a devil's advocate legal expert. Critically analyze and challenge this legal argument:

ARGUMENT: ${argument}

CASE CONTEXT:
- Case: ${caseData.title}
- Type: ${caseData.case_type}
- Our Position: ${caseData.our_position || 'Not specified'}
- Key Facts: ${caseData.key_facts?.join(', ') || 'None listed'}
- Legal Issues: ${caseData.legal_issues?.join(', ') || 'None listed'}

Provide a thorough critical analysis:
1. Identify 3-5 potential counterarguments (with severity: low/medium/high and suggested responses)
2. List 2-4 weaknesses in the argument
3. Rate the overall argument strength (0-100)
4. Provide 3-5 recommendations to strengthen the argument`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          counterarguments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                point: { type: 'string' },
                severity: { type: 'string' },
                suggested_response: { type: 'string' }
              }
            }
          },
          weaknesses_identified: { type: 'array', items: { type: 'string' } },
          strength_score: { type: 'number' },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setAnalysisResult(result);
    setAnalyzing(false);
  };

  const saveAnalysis = () => {
    saveMutation.mutate({
      case_id: caseId,
      argument,
      ...analysisResult
    });
  };

  const severityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700'
  };

  const getStrengthColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStrengthBg = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Devil's Advocate AI</h2>
          <p className="text-sm text-slate-500 mt-1">Challenge your arguments before opposing counsel does</p>
        </div>
        <Dialog open={analyzeOpen} onOpenChange={setAnalyzeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Analyze Argument
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Devil's Advocate Analysis
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Your Argument</Label>
                <Textarea
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                  placeholder="Enter the legal argument you want to test..."
                  className="mt-1.5 min-h-[150px]"
                />
              </div>

              <Button 
                type="button" 
                onClick={analyzeArgument}
                disabled={analyzing || !argument.trim()}
                className="w-full"
              >
                {analyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Challenge This Argument
              </Button>

              {analysisResult && (
                <div className="space-y-6 pt-4 border-t">
                  {/* Strength Score */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-2">Argument Strength</p>
                    <div className={`text-4xl font-bold ${getStrengthColor(analysisResult.strength_score)}`}>
                      {analysisResult.strength_score}%
                    </div>
                    <Progress 
                      value={analysisResult.strength_score} 
                      className="mt-2 h-2"
                      style={{ '--progress-background': getStrengthBg(analysisResult.strength_score) }}
                    />
                  </div>

                  {/* Counterarguments */}
                  {analysisResult.counterarguments?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-500" />
                        Potential Counterarguments
                      </h4>
                      <div className="space-y-3">
                        {analysisResult.counterarguments.map((ca, i) => (
                          <div key={i} className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-medium text-slate-900">{ca.point}</p>
                              <Badge className={severityColors[ca.severity]}>{ca.severity}</Badge>
                            </div>
                            <div className="bg-white rounded p-3 mt-2">
                              <p className="text-xs text-slate-500 mb-1">Suggested Response:</p>
                              <p className="text-sm text-slate-700">{ca.suggested_response}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {analysisResult.weaknesses_identified?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        Weaknesses Identified
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.weaknesses_identified.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-green-500" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => { setAnalyzeOpen(false); setAnalysisResult(null); setArgument(''); }}>
                      Discard
                    </Button>
                    <Button 
                      onClick={saveAnalysis}
                      disabled={saveMutation.isPending}
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Save Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading analyses...</div>
      ) : analyses.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No analyses yet</h3>
            <p className="text-slate-500">Test your arguments against potential challenges</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map(analysis => (
            <Card key={analysis.id} className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-slate-900">
                      Argument Analysis
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{analysis.argument}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Strength</p>
                      <p className={`text-2xl font-bold ${getStrengthColor(analysis.strength_score)}`}>
                        {analysis.strength_score}%
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMutation.mutate(analysis.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Counterarguments */}
                  {analysis.counterarguments?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-500" />
                        Counterarguments ({analysis.counterarguments.length})
                      </h4>
                      <div className="space-y-2">
                        {analysis.counterarguments.slice(0, 3).map((ca, i) => (
                          <div key={i} className="bg-slate-50 rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={severityColors[ca.severity]} variant="secondary">
                                {ca.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700">{ca.point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses & Recommendations */}
                  <div className="space-y-4">
                    {analysis.weaknesses_identified?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-amber-500" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-1">
                          {analysis.weaknesses_identified.slice(0, 3).map((w, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-amber-500 mt-2" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.recommendations?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-green-500" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {analysis.recommendations.slice(0, 3).map((r, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-green-500 mt-2" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}