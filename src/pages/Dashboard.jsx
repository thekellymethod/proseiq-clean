import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  FileText, 
  Scale, 
  Clock, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

export default function Dashboard() {
  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 50)
  });

  const { data: filings = [] } = useQuery({
    queryKey: ['filings'],
    queryFn: () => base44.entities.Filing.list('-deadline', 50)
  });

  const { data: motions = [] } = useQuery({
    queryKey: ['motions'],
    queryFn: () => base44.entities.Motion.list('-created_date', 20)
  });

  const activeCases = cases.filter(c => c.status !== 'closed' && c.status !== 'settled');
  const urgentCases = cases.filter(c => c.priority === 'urgent' || c.priority === 'high');
  
  const upcomingDeadlines = filings
    .filter(f => f.deadline && isBefore(new Date(), new Date(f.deadline)))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const pendingMotions = motions.filter(m => m.status === 'pending' || m.status === 'filed');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">
              Case <span className="font-semibold">Dashboard</span>
            </h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Link to={createPageUrl('NewCase')}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Active Cases</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">{activeCases.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Urgent Matters</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">{urgentCases.length}</p>
                </div>
                <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending Motions</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">{pendingMotions.length}</p>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Scale className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Upcoming Deadlines</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">{upcomingDeadlines.length}</p>
                </div>
                <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">Recent Cases</CardTitle>
                  <Link to={createPageUrl('Cases')} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {casesLoading ? (
                  <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : cases.length === 0 ? (
                  <div className="p-8 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No cases yet</p>
                    <Link to={createPageUrl('NewCase')}>
                      <Button variant="outline" className="mt-4">Create your first case</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cases.slice(0, 5).map(c => (
                      <Link 
                        key={c.id} 
                        to={createPageUrl(`CaseDetail?id=${c.id}`)}
                        className="block p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-900 truncate">{c.title}</h3>
                              <Badge className={priorityColors[c.priority] || priorityColors.medium} variant="secondary">
                                {c.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {c.client_name} • {c.case_type?.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge className={statusColors[c.status]} variant="secondary">
                            {c.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm">No upcoming deadlines</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {upcomingDeadlines.map(filing => {
                      const daysUntil = differenceInDays(new Date(filing.deadline), new Date());
                      const isUrgent = daysUntil <= 3;
                      return (
                        <div key={filing.id} className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 text-sm truncate">{filing.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{filing.filing_type?.replace('_', ' ')}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isUrgent ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}