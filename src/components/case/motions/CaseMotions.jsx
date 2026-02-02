import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Scale, 
  Plus,
  Loader2,
  Wand2,
  Calendar,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

export default function CaseMotions({ caseId, caseData }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    motion_type: '',
    status: 'drafting',
    filing_deadline: '',
    hearing_date: '',
    arguments: [],
    content: ''
  });
  const [newArgument, setNewArgument] = useState('');
  const queryClient = useQueryClient();

  const { data: motions = [], isLoading } = useQuery({
    queryKey: ['motions', caseId],
    queryFn: () => base44.entities.Motion.filter({ case_id: caseId }, '-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Motion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['motions', caseId]);
      setCreateOpen(false);
      setFormData({
        title: '',
        motion_type: '',
        status: 'drafting',
        filing_deadline: '',
        hearing_date: '',
        arguments: [],
        content: ''
      });
    }
  });

  const generateMotion = async () => {
    if (!formData.motion_type) return;
    setGenerating(true);

    const prompt = `You are a legal expert. Draft a ${formData.motion_type.replace('_', ' ')} motion for the following case:

Case Title: ${caseData.title}
Case Type: ${caseData.case_type}
Client: ${caseData.client_name}
Our Position: ${caseData.our_position || 'Not specified'}
Description: ${caseData.description || 'Not provided'}

Arguments to include: ${formData.arguments.join(', ') || 'None specified'}

Please provide:
1. A proper motion title
2. The full motion content with proper legal formatting
3. Key arguments summarized`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          key_arguments: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      title: result.title || prev.title,
      content: result.content || '',
      arguments: result.key_arguments || prev.arguments
    }));
    setGenerating(false);
  };

  const addArgument = () => {
    if (newArgument.trim()) {
      setFormData(prev => ({
        ...prev,
        arguments: [...prev.arguments, newArgument.trim()]
      }));
      setNewArgument('');
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.motion_type) return;
    await createMutation.mutateAsync({
      ...formData,
      case_id: caseId
    });
  };

  const statusColors = {
    drafting: 'bg-slate-100 text-slate-600',
    review: 'bg-amber-100 text-amber-600',
    filed: 'bg-blue-100 text-blue-600',
    pending: 'bg-purple-100 text-purple-600',
    granted: 'bg-green-100 text-green-600',
    denied: 'bg-red-100 text-red-600',
    withdrawn: 'bg-gray-100 text-gray-600'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Motions</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Draft Motion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Draft New Motion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Motion Type *</Label>
                  <Select value={formData.motion_type} onValueChange={(v) => setFormData({ ...formData, motion_type: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dismiss">Motion to Dismiss</SelectItem>
                      <SelectItem value="summary_judgment">Summary Judgment</SelectItem>
                      <SelectItem value="compel">Motion to Compel</SelectItem>
                      <SelectItem value="suppress">Motion to Suppress</SelectItem>
                      <SelectItem value="limine">Motion in Limine</SelectItem>
                      <SelectItem value="continuance">Motion for Continuance</SelectItem>
                      <SelectItem value="reconsideration">Motion for Reconsideration</SelectItem>
                      <SelectItem value="default_judgment">Default Judgment</SelectItem>
                      <SelectItem value="protective_order">Protective Order</SelectItem>
                      <SelectItem value="sanctions">Motion for Sanctions</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drafting">Drafting</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="filed">Filed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Motion Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Motion to Dismiss for Failure to State a Claim"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filing Deadline</Label>
                  <Input
                    type="date"
                    value={formData.filing_deadline}
                    onChange={(e) => setFormData({ ...formData, filing_deadline: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Hearing Date</Label>
                  <Input
                    type="date"
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Arguments</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={newArgument}
                    onChange={(e) => setNewArgument(e.target.value)}
                    placeholder="Add an argument point"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArgument())}
                  />
                  <Button type="button" variant="outline" onClick={addArgument}>Add</Button>
                </div>
                {formData.arguments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.arguments.map((arg, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100">
                        {arg}
                        <button 
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            arguments: prev.arguments.filter((_, idx) => idx !== i) 
                          }))}
                          className="ml-1 hover:text-red-500"
                        >×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={generateMotion}
                  disabled={generating || !formData.motion_type}
                  className="w-full"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Motion with AI
                </Button>
              </div>

              <div>
                <Label>Motion Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full motion text..."
                  className="mt-1.5 min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !formData.title || !formData.motion_type}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Motion
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading motions...</div>
      ) : motions.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No motions yet</h3>
            <p className="text-slate-500">Draft your first motion for this case</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {motions.map(motion => (
            <AccordionItem key={motion.id} value={motion.id} className="border-0">
              <Card className="border-0 shadow-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-start justify-between w-full mr-4">
                    <div className="text-left">
                      <h3 className="font-medium text-slate-900">{motion.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-slate-100">
                          {motion.motion_type?.replace('_', ' ')}
                        </Badge>
                        <Badge className={statusColors[motion.status]}>{motion.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {motion.hearing_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(motion.hearing_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  {motion.arguments?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Key Arguments</h4>
                      <ul className="space-y-1">
                        {motion.arguments.map((arg, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5" />
                            {arg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {motion.content && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Motion Content</h4>
                      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                        {motion.content}
                      </div>
                    </div>
                  )}
                  {motion.supporting_case_law?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Supporting Case Law</h4>
                      <div className="space-y-2">
                        {motion.supporting_case_law.map((law, i) => (
                          <div key={i} className="bg-blue-50 rounded-lg p-3">
                            <p className="font-medium text-blue-900 text-sm">{law.citation}</p>
                            <p className="text-blue-700 text-sm mt-1">{law.relevance}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}