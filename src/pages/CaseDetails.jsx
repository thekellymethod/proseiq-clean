import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  Scale,
  Brain,
  Lightbulb,
  Upload,
  Calendar,
  Building,
  User,
  Gavel,
  Clock,
  Edit,
  Plus,
  BookOpen,
  AlertTriangle,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import CaseDocuments from '@/components/case/CaseDocuments.jsx';
import CaseMotions from '@/components/case/CaseMotions.jsx';
import CaseStrategy from '@/components/case/CaseStrategy.jsx';
import CaseLawSection from '@/components/case/CaseLawSection.jsx';
import DevilsAdvocateSection from '@/components/case/DevilsAdvocateSection.jsx';
import CaseFilings from '@/components/case/CaseFilings.jsx';
import ProactiveCaseLaw from '@/components/case/ProactiveCaseLaw.jsx';
import CaseTimeline from '@/components/case/CaseTimeline.jsx';
import DamagesCalculator from '@/components/case/DamagesCalculator.jsx';

export default function CaseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => base44.entities.Case.filter({ id: caseId }),
    enabled: !!caseId
  });

  const currentCase = caseData?.[0];

  const statusColors = {
    intake: 'bg-blue-100 text-blue-700',
    discovery: 'bg-purple-100 text-purple-700',
    motions: 'bg-amber-100 text-amber-700',
    trial_prep: 'bg-orange-100 text-orange-700',
    trial: 'bg-red-100 text-red-700',
    appeal: 'bg-pink-100 text-pink-700',
    closed: 'bg-slate-100 text-slate-700',
    settled: 'bg-green-100 text-green-700'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-amber-100 text-amber-600',
    urgent: 'bg-red-100 text-red-600'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading case...</div>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Case not found</h2>
          <Link to={createPageUrl('Cases')}>
            <Button variant="outline">Back to Cases</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Cases')} className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">{currentCase.title}</h1>
                <Badge className={statusColors[currentCase.status]}>{currentCase.status?.replace('_', ' ')}</Badge>
                <Badge className={priorityColors[currentCase.priority]}>{currentCase.priority}</Badge>
              </div>
              {currentCase.case_number && (
                <p className="text-slate-500 mt-1">Case #{currentCase.case_number}</p>
              )}
            </div>
            <Link to={createPageUrl(`EditCase?id=${caseId}`)}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Case
              </Button>
            </Link>
            <Link to={createPageUrl(`CaseAnalysis?id=${caseId}`)}>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                <BarChart3 className="w-4 h-4 mr-2" />
                Case Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Case Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="font-medium text-slate-900">{currentCase.client_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentCase.court && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Court</p>
                    <p className="font-medium text-slate-900 text-sm">{currentCase.court}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentCase.judge && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Judge</p>
                    <p className="font-medium text-slate-900">{currentCase.judge}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentCase.trial_date && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Trial Date</p>
                    <p className="font-medium text-slate-900">{format(new Date(currentCase.trial_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-wrap h-auto bg-white border border-slate-200 rounded-lg p-1 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="motions" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Motions</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="caselaw" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Case Law</span>
            </TabsTrigger>
            <TabsTrigger value="devils" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Devil's Advocate</span>
            </TabsTrigger>
            <TabsTrigger value="filings" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Filings</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="damages" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Damages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* AI Suggestions */}
              <ProactiveCaseLaw caseData={currentCase} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-lg">Case Description</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {currentCase.description ? (
                    <p className="text-slate-600 whitespace-pre-wrap">{currentCase.description}</p>
                  ) : (
                    <p className="text-slate-400 italic">No description provided</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-lg">Case Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Case Type</dt>
                      <dd className="font-medium text-slate-900">{currentCase.case_type?.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Our Position</dt>
                      <dd className="font-medium text-slate-900">{currentCase.our_position || 'Not specified'}</dd>
                    </div>
                    {currentCase.opposing_party && (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Opposing Party</dt>
                        <dd className="font-medium text-slate-900">{currentCase.opposing_party}</dd>
                      </div>
                    )}
                    {currentCase.filing_date && (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Filing Date</dt>
                        <dd className="font-medium text-slate-900">{format(new Date(currentCase.filing_date), 'MMM d, yyyy')}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {currentCase.key_facts?.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg">Key Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      {currentCase.key_facts.map((fact, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span className="text-slate-600">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {currentCase.legal_issues?.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg">Legal Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      {currentCase.legal_issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          <span className="text-slate-600">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <CaseDocuments caseId={caseId} />
          </TabsContent>

          <TabsContent value="motions">
            <CaseMotions caseId={caseId} caseData={currentCase} />
          </TabsContent>

          <TabsContent value="strategy">
            <CaseStrategy caseId={caseId} caseData={currentCase} />
          </TabsContent>

          <TabsContent value="caselaw">
            <CaseLawSection caseId={caseId} caseData={currentCase} />
          </TabsContent>

          <TabsContent value="devils">
            <DevilsAdvocateSection caseId={caseId} caseData={currentCase} />
          </TabsContent>

          <TabsContent value="filings">
            <CaseFilings caseId={caseId} />
          </TabsContent>

          <TabsContent value="timeline">
            <CaseTimeline caseId={caseId} caseData={currentCase} />
          </TabsContent>

          <TabsContent value="damages">
            <DamagesCalculator caseId={caseId} caseData={currentCase} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}