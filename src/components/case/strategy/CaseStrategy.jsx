import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Lightbulb, 
  Plus,
  Loader2,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function CaseStrategy({ caseId, caseData }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    strategy_type: '',
    description: '',
    objectives: [],
    tactics: [],
    risks: [],
    success_probability: 50
  });
  const [newItem, setNewItem] = useState({ objectives: '', tactics: '', risks: '' });
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies', caseId],
    queryFn: () => base44.entities.LitigationStrategy.filter({ case_id: caseId }, '-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LitigationStrategy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['strategies', caseId]);
      setCreateOpen(false);
      setFormData({
        title: '',
        strategy_type: '',
        description: '',
        objectives: [],
        tactics: [],
        risks: [],
        success_probability: 50
      });
    }
  });

  const generateStrategy = async () => {
    if (!formData.strategy_type) return;
    setGenerating(true);

    const prompt = `You are an expert litigation strategist. Develop a comprehensive ${formData.strategy_type} litigation strategy for:

Case: ${caseData.title}
Type: ${caseData.case_type}
Client: ${caseData.client_name}
Position: ${caseData.our_position || 'Not specified'}
Description: ${caseData.description || 'Not provided'}
Key Facts: ${caseData.key_facts?.join(', ') || 'None listed'}
Legal Issues: ${caseData.legal_issues?.join(', ') || 'None listed'}

Provide a detailed strategy with:
1. A clear title
2. Overall description
3. 3-5 specific objectives
4. 4-6 tactical recommendations
5. 2-4 potential risks to consider
6. Estimated success probability (0-100)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          objectives: { type: 'array', items: { type: 'string' } },
          tactics: { type: 'array', items: { type: 'string' } },
          risks: { type: 'array', items: { type: 'string' } },
          success_probability: { type: 'number' }
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      ...result
    }));
    setGenerating(false);
  };

  const addItem = (field) => {
    if (newItem[field].trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], newItem[field].trim()]
      }));
      setNewItem(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const typeColors = {
    offensive: 'bg-red-100 text-red-700',
    defensive: 'bg-blue-100 text-blue-700',
    settlement: 'bg-green-100 text-green-700',
    discovery: 'bg-purple-100 text-purple-700',
    trial: 'bg-amber-100 text-amber-700'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Litigation Strategy</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Develop Litigation Strategy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Strategy Type *</Label>
                  <Select value={formData.strategy_type} onValueChange={(v) => setFormData({ ...formData, strategy_type: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offensive">Offensive</SelectItem>
                      <SelectItem value="defensive">Defensive</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Success Probability: {formData.success_probability}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.success_probability}
                    onChange={(e) => setFormData({ ...formData, success_probability: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Strategy Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Aggressive Discovery Push Strategy"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generateStrategy}
                  disabled={generating || !formData.strategy_type}
                  className="w-full"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Strategy with AI
                </Button>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overall strategy description..."
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              {['objectives', 'tactics', 'risks'].map((field) => (
                <div key={field}>
                  <Label className="capitalize">{field}</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={newItem[field]}
                      onChange={(e) => setNewItem(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={`Add ${field.slice(0, -1)}`}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(field))}
                    />
                    <Button type="button" variant="outline" onClick={() => addItem(field)}>Add</Button>
                  </div>
                  {formData[field].length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {formData[field].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-slate-50 p-2 rounded">
                          <span className="flex-1">{item}</span>
                          <button 
                            onClick={() => removeItem(field, i)}
                            className="text-slate-400 hover:text-red-500"
                          >×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => createMutation.mutate({ ...formData, case_id: caseId })}
                  disabled={createMutation.isPending || !formData.title || !formData.strategy_type}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Strategy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading strategies...</div>
      ) : strategies.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No strategies yet</h3>
            <p className="text-slate-500">Develop your first litigation strategy</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {strategies.map(strategy => (
            <Card key={strategy.id} className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    <Badge className={typeColors[strategy.strategy_type]} variant="secondary">
                      {strategy.strategy_type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{strategy.success_probability}% success</span>
                    </div>
                    <Progress value={strategy.success_probability} className="w-24 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {strategy.description && (
                  <p className="text-slate-600 mb-6">{strategy.description}</p>
                )}
                
                <div className="grid md:grid-cols-3 gap-6">
                  {strategy.objectives?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Objectives
                      </h4>
                      <ul className="space-y-2">
                        {strategy.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {strategy.tactics?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Tactics
                      </h4>
                      <ul className="space-y-2">
                        {strategy.tactics.map((tactic, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                            {tactic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {strategy.risks?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        Risks
                      </h4>
                      <ul className="space-y-2">
                        {strategy.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}