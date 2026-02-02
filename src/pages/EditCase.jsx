import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EditCase() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [newFact, setNewFact] = useState('');
  const [newIssue, setNewIssue] = useState('');

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => base44.entities.Case.filter({ id: caseId }),
    enabled: !!caseId
  });

  useEffect(() => {
    if (caseData?.[0]) {
      setFormData(caseData[0]);
    }
  }, [caseData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFact = () => {
    if (newFact.trim()) {
      setFormData(prev => ({
        ...prev,
        key_facts: [...(prev.key_facts || []), newFact.trim()]
      }));
      setNewFact('');
    }
  };

  const removeFact = (index) => {
    setFormData(prev => ({
      ...prev,
      key_facts: prev.key_facts.filter((_, i) => i !== index)
    }));
  };

  const addIssue = () => {
    if (newIssue.trim()) {
      setFormData(prev => ({
        ...prev,
        legal_issues: [...(prev.legal_issues || []), newIssue.trim()]
      }));
      setNewIssue('');
    }
  };

  const removeIssue = (index) => {
    setFormData(prev => ({
      ...prev,
      legal_issues: prev.legal_issues.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Case.update(caseId, formData);
    navigate(createPageUrl(`CaseDetail?id=${caseId}`));
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl(`CaseDetail?id=${caseId}`)} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case
          </Link>
          <h1 className="text-3xl font-light text-slate-900 tracking-tight">
            Edit <span className="font-semibold">Case</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Case Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="case_number">Case Number</Label>
                    <Input
                      id="case_number"
                      value={formData.case_number || ''}
                      onChange={(e) => handleChange('case_number', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="case_type">Case Type</Label>
                    <Select value={formData.case_type || ''} onValueChange={(v) => handleChange('case_type', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil">Civil</SelectItem>
                        <SelectItem value="criminal">Criminal</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="intellectual_property">Intellectual Property</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
                        <SelectItem value="personal_injury">Personal Injury</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status || ''} onValueChange={(v) => handleChange('status', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intake">Intake</SelectItem>
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="motions">Motions</SelectItem>
                        <SelectItem value="trial_prep">Trial Prep</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="appeal">Appeal</SelectItem>
                        <SelectItem value="settled">Settled</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority || ''} onValueChange={(v) => handleChange('priority', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold">Parties</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name || ''}
                      onChange={(e) => handleChange('client_name', e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="opposing_party">Opposing Party</Label>
                    <Input
                      id="opposing_party"
                      value={formData.opposing_party || ''}
                      onChange={(e) => handleChange('opposing_party', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="our_position">Our Position</Label>
                    <Select value={formData.our_position || ''} onValueChange={(v) => handleChange('our_position', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plaintiff">Plaintiff</SelectItem>
                        <SelectItem value="defendant">Defendant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Court Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold">Court Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="court">Court</Label>
                    <Input
                      id="court"
                      value={formData.court || ''}
                      onChange={(e) => handleChange('court', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="judge">Judge</Label>
                    <Input
                      id="judge"
                      value={formData.judge || ''}
                      onChange={(e) => handleChange('judge', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filing_date">Filing Date</Label>
                    <Input
                      id="filing_date"
                      type="date"
                      value={formData.filing_date || ''}
                      onChange={(e) => handleChange('filing_date', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trial_date">Trial Date</Label>
                    <Input
                      id="trial_date"
                      type="date"
                      value={formData.trial_date || ''}
                      onChange={(e) => handleChange('trial_date', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold">Case Description</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="min-h-32"
                />
              </CardContent>
            </Card>

            {/* Key Facts */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold">Key Facts</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    placeholder="Add a key fact"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFact())}
                  />
                  <Button type="button" variant="outline" onClick={addFact}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.key_facts?.length > 0 && (
                  <div className="space-y-2">
                    {formData.key_facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                        <span className="flex-1 text-sm">{fact}</span>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFact(i)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legal Issues */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold">Legal Issues</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="Add a legal issue"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
                  />
                  <Button type="button" variant="outline" onClick={addIssue}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.legal_issues?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.legal_issues.map((issue, i) => (
                      <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 py-1.5 px-3">
                        {issue}
                        <button 
                          type="button"
                          onClick={() => removeIssue(i)}
                          className="ml-2 hover:text-red-500"
                        >×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Link to={createPageUrl(`CaseDetail?id=${caseId}`)}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}