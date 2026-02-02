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
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function CaseTimeline({ caseId, caseData }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    event_date: '',
    event_type: '',
    title: '',
    description: '',
    parties_involved: [],
    importance: 'medium'
  });
  const [newParty, setNewParty] = useState('');
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['timeline', caseId],
    queryFn: () => base44.entities.Timeline.filter({ case_id: caseId }, 'event_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Timeline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeline', caseId]);
      setCreateOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Timeline.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['timeline', caseId])
  });

  const resetForm = () => {
    setFormData({
      event_date: '',
      event_type: '',
      title: '',
      description: '',
      parties_involved: [],
      importance: 'medium'
    });
    setNewParty('');
  };

  const addParty = () => {
    if (newParty.trim()) {
      setFormData(prev => ({
        ...prev,
        parties_involved: [...prev.parties_involved, newParty.trim()]
      }));
      setNewParty('');
    }
  };

  const importanceColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-amber-100 text-amber-600',
    critical: 'bg-red-100 text-red-600'
  };

  const eventIcons = {
    incident: '⚡',
    filing: '📄',
    discovery: '🔍',
    motion: '⚖️',
    hearing: '🏛️',
    deposition: '🎤',
    settlement_discussion: '🤝',
    trial: '⚖️',
    deadline: '⏰',
    correspondence: '✉️',
    other: '📌'
  };

  const getDaysFromNow = (date) => {
    return differenceInDays(new Date(date), new Date());
  };

  const getStatuteLimitation = () => {
    if (!caseData.statute_of_limitations) return null;
    const days = getDaysFromNow(caseData.statute_of_limitations);
    if (days < 0) return { label: 'EXPIRED', color: 'text-red-600', urgent: true };
    if (days <= 30) return { label: `${days} days left`, color: 'text-red-600', urgent: true };
    if (days <= 90) return { label: `${days} days left`, color: 'text-amber-600', urgent: true };
    return { label: `${days} days left`, color: 'text-slate-600', urgent: false };
  };

  const statuteInfo = getStatuteLimitation();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Case Timeline</h2>
          {statuteInfo && (
            <div className={`flex items-center gap-2 mt-1 ${statuteInfo.color}`}>
              {statuteInfo.urgent && <AlertTriangle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                Statute of Limitations: {statuteInfo.label}
                {caseData.statute_of_limitations && ` (${format(new Date(caseData.statute_of_limitations), 'MMM d, yyyy')})`}
              </span>
            </div>
          )}
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Timeline Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Date *</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Event Type *</Label>
                  <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="filing">Filing</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="motion">Motion</SelectItem>
                      <SelectItem value="hearing">Hearing</SelectItem>
                      <SelectItem value="deposition">Deposition</SelectItem>
                      <SelectItem value="settlement_discussion">Settlement Discussion</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="correspondence">Correspondence</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Incident occurred"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this event..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Importance</Label>
                <Select value={formData.importance} onValueChange={(v) => setFormData({ ...formData, importance: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Parties Involved</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={newParty}
                    onChange={(e) => setNewParty(e.target.value)}
                    placeholder="Add party"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParty())}
                  />
                  <Button type="button" variant="outline" onClick={addParty}>Add</Button>
                </div>
                {formData.parties_involved.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.parties_involved.map((party, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100">
                        {party}
                        <button 
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            parties_involved: prev.parties_involved.filter((_, idx) => idx !== i) 
                          }))}
                          className="ml-1 hover:text-red-500"
                        >×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
                <Button 
                  onClick={() => createMutation.mutate({ ...formData, case_id: caseId })}
                  disabled={createMutation.isPending || !formData.event_date || !formData.title || !formData.event_type}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Add Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading timeline...</div>
      ) : events.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No events yet</h3>
            <p className="text-slate-500">Build your case timeline with key dates and events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
          
          <div className="space-y-6">
            {events.map((event, idx) => (
              <div key={event.id} className="relative pl-16">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white ${importanceColors[event.importance].split(' ')[0]}`} />
                
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{eventIcons[event.event_type] || '📌'}</span>
                          <div>
                            <h4 className="font-medium text-slate-900">{event.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="text-sm text-slate-500">
                                {format(new Date(event.event_date), 'MMMM d, yyyy')}
                              </span>
                              <Badge variant="secondary" className="text-xs bg-slate-100">
                                {event.event_type?.replace('_', ' ')}
                              </Badge>
                              <Badge className={importanceColors[event.importance]}>
                                {event.importance}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-slate-600 mt-2">{event.description}</p>
                        )}
                        {event.parties_involved?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.parties_involved.map((party, i) => (
                              <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                {party}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteMutation.mutate(event.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}