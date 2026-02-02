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
  Clock, 
  Plus,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Send
} from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';

export default function CaseFilings({ caseId }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    filing_type: '',
    title: '',
    status: 'preparing',
    deadline: '',
    filed_date: '',
    confirmation_number: '',
    served_parties: [],
    notes: ''
  });
  const [newParty, setNewParty] = useState('');
  const queryClient = useQueryClient();

  const { data: filings = [], isLoading } = useQuery({
    queryKey: ['filings', caseId],
    queryFn: () => base44.entities.Filing.filter({ case_id: caseId }, '-deadline')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Filing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['filings', caseId]);
      setCreateOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Filing.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['filings', caseId])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Filing.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['filings', caseId])
  });

  const resetForm = () => {
    setFormData({
      filing_type: '',
      title: '',
      status: 'preparing',
      deadline: '',
      filed_date: '',
      confirmation_number: '',
      served_parties: [],
      notes: ''
    });
    setNewParty('');
  };

  const addParty = () => {
    if (newParty.trim()) {
      setFormData(prev => ({
        ...prev,
        served_parties: [...prev.served_parties, newParty.trim()]
      }));
      setNewParty('');
    }
  };

  const statusColors = {
    preparing: 'bg-slate-100 text-slate-600',
    ready: 'bg-blue-100 text-blue-600',
    filed: 'bg-green-100 text-green-600',
    served: 'bg-purple-100 text-purple-600',
    rejected: 'bg-red-100 text-red-600'
  };

  const statusIcons = {
    preparing: Clock,
    ready: FileText,
    filed: CheckCircle2,
    served: Send,
    rejected: AlertCircle
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-50' };
    if (days === 0) return { label: 'Due Today', color: 'text-red-600 bg-red-50' };
    if (days <= 3) return { label: `${days} days`, color: 'text-amber-600 bg-amber-50' };
    if (days <= 7) return { label: `${days} days`, color: 'text-blue-600 bg-blue-50' };
    return { label: `${days} days`, color: 'text-slate-600 bg-slate-50' };
  };

  const upcomingFilings = filings.filter(f => f.status !== 'filed' && f.status !== 'served' && f.deadline);
  const completedFilings = filings.filter(f => f.status === 'filed' || f.status === 'served');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Filings & Notices</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New Filing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Filing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Filing Type *</Label>
                <Select value={formData.filing_type} onValueChange={(v) => setFormData({ ...formData, filing_type: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="answer">Answer</SelectItem>
                    <SelectItem value="motion">Motion</SelectItem>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="subpoena">Subpoena</SelectItem>
                    <SelectItem value="discovery_request">Discovery Request</SelectItem>
                    <SelectItem value="response">Response</SelectItem>
                    <SelectItem value="appeal">Appeal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Notice of Motion"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready to File</SelectItem>
                      <SelectItem value="filed">Filed</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filed Date</Label>
                  <Input
                    type="date"
                    value={formData.filed_date}
                    onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Confirmation #</Label>
                  <Input
                    value={formData.confirmation_number}
                    onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
                    placeholder="e.g., CF-2024-12345"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Served Parties</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={newParty}
                    onChange={(e) => setNewParty(e.target.value)}
                    placeholder="Add party name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParty())}
                  />
                  <Button type="button" variant="outline" onClick={addParty}>Add</Button>
                </div>
                {formData.served_parties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.served_parties.map((party, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100">
                        {party}
                        <button 
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            served_parties: prev.served_parties.filter((_, idx) => idx !== i) 
                          }))}
                          className="ml-1 hover:text-red-500"
                        >×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
                <Button 
                  onClick={() => createMutation.mutate({ ...formData, case_id: caseId })}
                  disabled={createMutation.isPending || !formData.title || !formData.filing_type}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Create Filing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading filings...</div>
      ) : filings.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No filings yet</h3>
            <p className="text-slate-500">Track your court filings and deadlines</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Filings */}
          {upcomingFilings.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                {upcomingFilings
                  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                  .map(filing => {
                    const deadlineStatus = getDeadlineStatus(filing.deadline);
                    const StatusIcon = statusIcons[filing.status];
                    return (
                      <Card key={filing.id} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${statusColors[filing.status].split(' ')[0]}`}>
                                <StatusIcon className={`w-5 h-5 ${statusColors[filing.status].split(' ')[1]}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">{filing.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                    {filing.filing_type?.replace('_', ' ')}
                                  </Badge>
                                  <Badge className={statusColors[filing.status]}>{filing.status}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {deadlineStatus && (
                                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${deadlineStatus.color}`}>
                                  {deadlineStatus.label}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateMutation.mutate({ 
                                    id: filing.id, 
                                    data: { status: 'filed', filed_date: format(new Date(), 'yyyy-MM-dd') }
                                  })}
                                >
                                  Mark Filed
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteMutation.mutate(filing.id)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Completed Filings */}
          {completedFilings.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Completed Filings
              </h3>
              <div className="space-y-3">
                {completedFilings.map(filing => (
                  <Card key={filing.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{filing.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                              <span>{filing.filing_type?.replace('_', ' ')}</span>
                              {filing.filed_date && (
                                <>
                                  <span>•</span>
                                  <span>Filed {format(new Date(filing.filed_date), 'MMM d, yyyy')}</span>
                                </>
                              )}
                              {filing.confirmation_number && (
                                <>
                                  <span>•</span>
                                  <span>#{filing.confirmation_number}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={statusColors[filing.status]}>{filing.status}</Badge>
                      </div>
                      {filing.served_parties?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500 mb-1">Served to:</p>
                          <div className="flex flex-wrap gap-1">
                            {filing.served_parties.map((party, i) => (
                              <Badge key={i} variant="secondary" className="bg-slate-100 text-xs">
                                {party}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}