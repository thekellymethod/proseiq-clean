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
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Plus,
  Loader2,
  Sparkles,
  Calculator,
  Trash2,
  TrendingUp
} from 'lucide-react';

export default function DamagesCalculator({ caseId, caseData }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [formData, setFormData] = useState({
    claim_type: '',
    amount: '',
    description: '',
    legal_basis: '',
    supporting_evidence: [],
    probability_of_recovery: 50
  });
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['damages', caseId],
    queryFn: () => base44.entities.DamagesClaim.filter({ case_id: caseId }, '-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DamagesClaim.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['damages', caseId]);
      setCreateOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DamagesClaim.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['damages', caseId])
  });

  const resetForm = () => {
    setFormData({
      claim_type: '',
      amount: '',
      description: '',
      legal_basis: '',
      supporting_evidence: [],
      probability_of_recovery: 50
    });
  };

  const calculateDamages = async () => {
    setCalculating(true);

    const prompt = `Based on this case information, estimate potential damages claims:

CASE: ${caseData.title}
TYPE: ${caseData.case_type}
POSITION: ${caseData.our_position}
KEY FACTS: ${caseData.key_facts?.join(', ') || 'None listed'}
LEGAL ISSUES: ${caseData.legal_issues?.join(', ') || 'None listed'}
DESCRIPTION: ${caseData.description || 'N/A'}

Provide 3-5 potential damage claims with:
- Claim type (compensatory, punitive, economic, medical, lost wages, etc.)
- Estimated amount range (use midpoint)
- Description of the claim
- Legal basis for the claim
- Probability of recovery (0-100%)

Be realistic and consider applicable laws and precedents.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          claims: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                claim_type: { type: 'string' },
                amount: { type: 'number' },
                description: { type: 'string' },
                legal_basis: { type: 'string' },
                probability_of_recovery: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Add all suggested claims
    for (const claim of result.claims || []) {
      await base44.entities.DamagesClaim.create({
        case_id: caseId,
        ...claim
      });
    }

    queryClient.invalidateQueries(['damages', caseId]);
    setCalculating(false);
  };

  const totalClaimed = claims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
  const expectedRecovery = claims.reduce((sum, claim) => 
    sum + ((claim.amount || 0) * (claim.probability_of_recovery || 0) / 100), 0
  );

  const claimTypeColors = {
    compensatory: 'bg-blue-100 text-blue-700',
    punitive: 'bg-red-100 text-red-700',
    economic: 'bg-green-100 text-green-700',
    non_economic: 'bg-purple-100 text-purple-700',
    medical_expenses: 'bg-cyan-100 text-cyan-700',
    lost_wages: 'bg-amber-100 text-amber-700',
    property_damage: 'bg-orange-100 text-orange-700',
    pain_suffering: 'bg-pink-100 text-pink-700',
    emotional_distress: 'bg-violet-100 text-violet-700',
    loss_of_consortium: 'bg-indigo-100 text-indigo-700',
    other: 'bg-slate-100 text-slate-700'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Damages Calculator</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={calculateDamages}
            disabled={calculating}
          >
            {calculating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Calculate
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Damages Claim</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Claim Type *</Label>
                  <Select value={formData.claim_type} onValueChange={(v) => setFormData({ ...formData, claim_type: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compensatory">Compensatory</SelectItem>
                      <SelectItem value="punitive">Punitive</SelectItem>
                      <SelectItem value="economic">Economic</SelectItem>
                      <SelectItem value="non_economic">Non-Economic</SelectItem>
                      <SelectItem value="medical_expenses">Medical Expenses</SelectItem>
                      <SelectItem value="lost_wages">Lost Wages</SelectItem>
                      <SelectItem value="property_damage">Property Damage</SelectItem>
                      <SelectItem value="pain_suffering">Pain & Suffering</SelectItem>
                      <SelectItem value="emotional_distress">Emotional Distress</SelectItem>
                      <SelectItem value="loss_of_consortium">Loss of Consortium</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount ($) *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100000"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the damages..."
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Legal Basis</Label>
                  <Input
                    value={formData.legal_basis}
                    onChange={(e) => setFormData({ ...formData, legal_basis: e.target.value })}
                    placeholder="e.g., Negligence per se"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Probability of Recovery (%): {formData.probability_of_recovery}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.probability_of_recovery}
                    onChange={(e) => setFormData({ ...formData, probability_of_recovery: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
                  <Button 
                    onClick={() => createMutation.mutate({ ...formData, amount: parseFloat(formData.amount), case_id: caseId })}
                    disabled={createMutation.isPending || !formData.claim_type || !formData.amount}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Add Claim
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Claimed</p>
                <p className="font-bold text-lg text-slate-900">${totalClaimed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Expected Recovery</p>
                <p className="font-bold text-lg text-slate-900">${expectedRecovery.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Claims Count</p>
                <p className="font-bold text-lg text-slate-900">{claims.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading damages...</div>
      ) : claims.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No damages claimed</h3>
            <p className="text-slate-500">Add damage claims or let AI calculate them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <Card key={claim.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={claimTypeColors[claim.claim_type]}>
                        {claim.claim_type?.replace('_', ' ')}
                      </Badge>
                      <span className="text-2xl font-bold text-slate-900">
                        ${claim.amount?.toLocaleString()}
                      </span>
                    </div>
                    {claim.description && (
                      <p className="text-sm text-slate-600 mb-2">{claim.description}</p>
                    )}
                    {claim.legal_basis && (
                      <p className="text-xs text-slate-500 mb-2">
                        <span className="font-medium">Legal Basis:</span> {claim.legal_basis}
                      </p>
                    )}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Recovery Probability</span>
                        <span className="font-medium">{claim.probability_of_recovery}%</span>
                      </div>
                      <Progress value={claim.probability_of_recovery} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        Expected: ${((claim.amount || 0) * (claim.probability_of_recovery || 0) / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteMutation.mutate(claim.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}