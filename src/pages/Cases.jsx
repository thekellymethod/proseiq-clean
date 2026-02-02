import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Briefcase,
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

export default function Cases() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 100)
  });

  const filteredCases = cases.filter(c => {
    const matchesSearch = !search || 
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.case_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === '-created_date') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'created_date') return new Date(a.created_date) - new Date(b.created_date);
    if (sortBy === 'title') return a.title?.localeCompare(b.title);
    if (sortBy === '-priority') {
      const order = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (order[b.priority] || 0) - (order[a.priority] || 0);
    }
    return 0;
  });

  const statusColors = {
    intake: 'bg-blue-100 text-blue-700 border-blue-200',
    discovery: 'bg-purple-100 text-purple-700 border-purple-200',
    motions: 'bg-amber-100 text-amber-700 border-amber-200',
    trial_prep: 'bg-orange-100 text-orange-700 border-orange-200',
    trial: 'bg-red-100 text-red-700 border-red-200',
    appeal: 'bg-pink-100 text-pink-700 border-pink-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',
    settled: 'bg-green-100 text-green-700 border-green-200'
  };

  const priorityIndicator = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    urgent: 'bg-red-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">
              Case <span className="font-semibold">Management</span>
            </h1>
            <p className="text-slate-500 mt-1">{cases.length} total cases</p>
          </div>
          <Link to={createPageUrl('NewCase')}>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <Filter className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Case Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="personal_injury">Personal Injury</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_date">Newest First</SelectItem>
                  <SelectItem value="created_date">Oldest First</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                  <SelectItem value="-priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading cases...</div>
        ) : sortedCases.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No cases found</h3>
              <p className="text-slate-500 mb-6">
                {search || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first case'}
              </p>
              {!search && statusFilter === 'all' && typeFilter === 'all' && (
                <Link to={createPageUrl('NewCase')}>
                  <Button className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Case
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCases.map(c => (
              <Link key={c.id} to={createPageUrl(`CaseDetail?id=${c.id}`)}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 h-full group">
                  <CardContent className="p-0">
                    <div className={`h-1 ${priorityIndicator[c.priority] || priorityIndicator.medium}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {c.title}
                        </h3>
                        <Badge className={statusColors[c.status]} variant="outline">
                          {c.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{c.client_name}</span>
                        </div>
                        {c.court && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{c.court}</span>
                          </div>
                        )}
                        {c.filing_date && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{format(new Date(c.filing_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          {c.case_type?.replace('_', ' ')}
                        </Badge>
                        {c.case_number && (
                          <span className="text-xs text-slate-500">#{c.case_number}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}