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
  FileText, 
  Plus,
  Loader2,
  Search,
  Copy,
  Edit,
  Trash2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function Templates() {
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    content: '',
    variables: []
  });
  const [newVariable, setNewVariable] = useState('');
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      setCreateOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['templates'])
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      content: '',
      variables: []
    });
    setNewVariable('');
  };

  const generateTemplate = async () => {
    if (!formData.category) return;
    setGenerating(true);

    const prompt = `Create a professional legal document template for: ${formData.category.replace('_', ' ')}

Provide:
1. A clear template name
2. Brief description
3. The full template content with placeholders in [BRACKETS] for customizable fields
4. List of all variable placeholders used

Make it professional, legally sound, and comprehensive.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'string' },
          variables: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      ...result
    }));
    setGenerating(false);
  };

  const addVariable = () => {
    if (newVariable.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable('');
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Template copied to clipboard');
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !search || 
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryColors = {
    motion: 'bg-blue-100 text-blue-700',
    pleading: 'bg-purple-100 text-purple-700',
    discovery: 'bg-amber-100 text-amber-700',
    notice: 'bg-green-100 text-green-700',
    brief: 'bg-red-100 text-red-700',
    letter: 'bg-pink-100 text-pink-700',
    contract: 'bg-cyan-100 text-cyan-700',
    other: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">
              Document <span className="font-semibold">Templates</span>
            </h1>
            <p className="text-slate-500 mt-1">{templates.length} templates available</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motion">Motion</SelectItem>
                        <SelectItem value="pleading">Pleading</SelectItem>
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="brief">Brief</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateTemplate}
                      disabled={generating || !formData.category}
                      className="w-full"
                    >
                      {generating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Template Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Motion to Dismiss Template"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the template"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Variables (placeholders)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      placeholder="e.g., [CLIENT_NAME]"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                    />
                    <Button type="button" variant="outline" onClick={addVariable}>Add</Button>
                  </div>
                  {formData.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.variables.map((variable, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700">
                          {variable}
                          <button 
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              variables: prev.variables.filter((_, idx) => idx !== i) 
                            }))}
                            className="ml-1 hover:text-red-500"
                          >×</button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Template Content *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Template content with [PLACEHOLDERS]..."
                    className="mt-1.5 min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
                  <Button 
                    onClick={() => createMutation.mutate(formData)}
                    disabled={createMutation.isPending || !formData.name || !formData.category || !formData.content}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Save Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40 border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="motion">Motion</SelectItem>
                  <SelectItem value="pleading">Pleading</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="notice">Notice</SelectItem>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No templates found</h3>
              <p className="text-slate-500">Create your first template to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={categoryColors[template.category]}>
                      {template.category}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(template.content)}
                        className="h-8 w-8"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteMutation.mutate(template.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{template.description}</p>
                  )}
                  {template.variables?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.slice(0, 3).map((v, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {v}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-slate-400">+{template.variables.length - 3} more</span>
                      )}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setViewTemplate(template)}
                  >
                    View Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Template Dialog */}
        <Dialog open={!!viewTemplate} onOpenChange={() => setViewTemplate(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewTemplate?.name}</DialogTitle>
            </DialogHeader>
            {viewTemplate && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Badge className={categoryColors[viewTemplate.category]}>
                    {viewTemplate.category}
                  </Badge>
                  {viewTemplate.description && (
                    <span className="text-sm text-slate-500">{viewTemplate.description}</span>
                  )}
                </div>
                {viewTemplate.variables?.length > 0 && (
                  <div>
                    <Label className="text-sm">Variables</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewTemplate.variables.map((v, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Content</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(viewTemplate.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                    {viewTemplate.content}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}