import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    client_name: '',
    opposing_party: '',
    case_type: '',
    status: 'intake',
    court: '',
    judge: '',
    filing_date: '',
    trial_date: '',
    description: '',
    our_position: '',
    priority: 'medium'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newCase = await base44.entities.Case.create(formData);
    navigate(createPageUrl(`CaseDetail?id=${newCase.id}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Cases')} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Link>
          <h1 className="text-3xl font-light text-slate-900 tracking-tight">
            New <span className="font-semibold">Case</span>
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
                      placeholder="e.g., Smith v. Jones"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="case_number">Case Number</Label>
                    <Input
                      id="case_number"
                      placeholder="e.g., 2024-CV-12345"
                      value={formData.case_number}
                      onChange={(e) => handleChange('case_number', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="case_type">Case Type *</Label>
                    <Select value={formData.case_type} onValueChange={(v) => handleChange('case_type', v)}>
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
                      placeholder="Client's full name"
                      value={formData.client_name}
                      onChange={(e) => handleChange('client_name', e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="opposing_party">Opposing Party</Label>
                    <Input
                      id="opposing_party"
                      placeholder="Opposing party name"
                      value={formData.opposing_party}
                      onChange={(e) => handleChange('opposing_party', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="our_position">Our Position</Label>
                    <Select value={formData.our_position} onValueChange={(v) => handleChange('our_position', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plaintiff">Plaintiff</SelectItem>
                        <SelectItem value="defendant">Defendant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
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
                      placeholder="e.g., Superior Court of California"
                      value={formData.court}
                      onChange={(e) => handleChange('court', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="judge">Judge</Label>
                    <Input
                      id="judge"
                      placeholder="Assigned judge"
                      value={formData.judge}
                      onChange={(e) => handleChange('judge', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filing_date">Filing Date</Label>
                    <Input
                      id="filing_date"
                      type="date"
                      value={formData.filing_date}
                      onChange={(e) => handleChange('filing_date', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trial_date">Trial Date</Label>
                    <Input
                      id="trial_date"
                      type="date"
                      value={formData.trial_date}
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
                  placeholder="Describe the case facts, background, and relevant details..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="min-h-32"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Link to={createPageUrl('Cases')}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Case
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}