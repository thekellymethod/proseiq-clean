"use client";

import { useEffect, useState } from "react";
import * as api from "./api";

type Tier = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  pricing: string | null;
  includes: string[];
  sort_order: number;
};

type Module = {
  id: string;
  tier_id: string;
  slug: string;
  title: string;
  outcome: string | null;
  sort_order: number;
};

type Content = {
  id: string;
  module_id: string;
  kind: string;
  title: string | null;
  content: string | null;
  content_rich: unknown;
  media: unknown[];
  sort_order: number;
};

export default function AdminAcademy() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Tier> & { includesStr?: string }>({});
  const [moduleForm, setModuleForm] = useState<Partial<Module>>({});
  const [contentForm, setContentForm] = useState<Partial<Content> & { mediaStr?: string }>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [showTierForm, setShowTierForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);

  const loadTiers = async () => {
    const { items } = await api.get<{ items: Tier[] }>("/academy/tiers");
    setTiers(items);
  };

  const loadModules = async (tierId?: string) => {
    const url = tierId ? `/academy/modules?tier_id=${tierId}` : "/academy/modules";
    const { items } = await api.get<{ items: Module[] }>(url);
    setModules(items);
  };

  const loadContent = async (moduleId?: string) => {
    if (!moduleId) {
      setContent([]);
      return;
    }
    const { items } = await api.get<{ items: Content[] }>(`/academy/content?module_id=${moduleId}`);
    setContent(items);
  };

  useEffect(() => {
    loadTiers()
      .then(() => setLoading(false))
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedTier) loadModules(selectedTier);
    else setModules([]);
  }, [selectedTier]);

  useEffect(() => {
    if (selectedModule) loadContent(selectedModule);
    else setContent([]);
  }, [selectedModule]);

  const saveTier = async () => {
    const includes = form.includesStr
      ? form.includesStr.split("\n").map((s) => s.trim()).filter(Boolean)
      : form.includes ?? [];
    await api.post("/academy/tiers", {
      slug: form.slug,
      title: form.title,
      tagline: form.tagline || null,
      pricing: form.pricing || null,
      includes,
      sort_order: form.sort_order ?? 0,
    });
    await loadTiers();
    setForm({});
    setShowTierForm(false);
  };

  const saveModule = async () => {
    if (!selectedTier) return;
    await api.post("/academy/modules", {
      tier_id: selectedTier,
      slug: moduleForm.slug,
      title: moduleForm.title,
      outcome: moduleForm.outcome || null,
      sort_order: moduleForm.sort_order ?? 0,
    });
    await loadModules(selectedTier);
    setModuleForm({});
    setShowModuleForm(false);
  };

  const saveContent = async () => {
    if (!selectedModule) return;
    let media: unknown[] = [];
    try {
      media = contentForm.mediaStr ? JSON.parse(contentForm.mediaStr) : [];
    } catch {
      media = [];
    }
    await api.post("/academy/content", {
      module_id: selectedModule,
      kind: contentForm.kind ?? "lesson",
      title: contentForm.title || null,
      content: contentForm.content || null,
      content_rich: contentForm.content_rich ?? null,
      media,
      sort_order: contentForm.sort_order ?? 0,
    });
    await loadContent(selectedModule);
    setContentForm({});
    setShowContentForm(false);
  };

  const deleteTier = async (id: string) => {
    if (!confirm("Delete this tier and all its modules?")) return;
    await api.del(`/academy/tiers/${id}`);
    await loadTiers();
    if (selectedTier === id) setSelectedTier(null);
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its content?")) return;
    await api.del(`/academy/modules/${id}`);
    if (selectedTier) await loadModules(selectedTier);
    if (selectedModule === id) setSelectedModule(null);
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    await api.del(`/academy/content/${id}`);
    if (selectedModule) await loadContent(selectedModule);
  };

  if (loading) return <p className="text-slate-400">Loading…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Academy Tiers</h2>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowTierForm(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500"
          >
            + Add tier
          </button>
        </div>

        {showTierForm && (
          <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h3 className="mb-3 text-sm font-medium">New tier</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="slug (e.g. tier-1)"
                value={form.slug ?? ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                placeholder="title"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                placeholder="tagline"
                value={form.tagline ?? ""}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                placeholder="pricing"
                value={form.pricing ?? ""}
                onChange={(e) => setForm({ ...form, pricing: e.target.value })}
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <div className="sm:col-span-2">
                <textarea
                  placeholder="includes (one per line)"
                  value={form.includesStr ?? form.includes?.join("\n") ?? ""}
                  onChange={(e) => setForm({ ...form, includesStr: e.target.value })}
                  rows={3}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={saveTier} className="rounded bg-amber-600 px-4 py-2 text-sm text-white">
                Save
              </button>
              <button onClick={() => setShowTierForm(false)} className="rounded bg-slate-700 px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                selectedTier === t.id ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700 bg-slate-800/50"
              }`}
            >
              <button
                onClick={() => setSelectedTier(selectedTier === t.id ? null : t.id)}
                className="flex-1 text-left"
              >
                <span className="font-medium">{t.title}</span>
                <span className="ml-2 text-slate-400">({t.slug})</span>
              </button>
              <div className="flex gap-2">
                <a href={`/academy/${t.slug}`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline">
                  View
                </a>
                <button onClick={() => deleteTier(t.id)} className="text-xs text-red-400 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedTier && (
        <section>
          <h2 className="mb-4 text-lg font-medium text-white">
            Modules in {tiers.find((t) => t.id === selectedTier)?.title}
          </h2>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowModuleForm(true)}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500"
            >
              + Add module
            </button>
          </div>

          {showModuleForm && (
            <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h3 className="mb-3 text-sm font-medium">New module</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="slug"
                  value={moduleForm.slug ?? ""}
                  onChange={(e) => setModuleForm({ ...moduleForm, slug: e.target.value })}
                  className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                />
                <input
                  placeholder="title"
                  value={moduleForm.title ?? ""}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                />
                <div className="sm:col-span-2">
                  <input
                    placeholder="outcome"
                    value={moduleForm.outcome ?? ""}
                    onChange={(e) => setModuleForm({ ...moduleForm, outcome: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveModule} className="rounded bg-amber-600 px-4 py-2 text-sm text-white">
                  Save
                </button>
                <button onClick={() => setShowModuleForm(false)} className="rounded bg-slate-700 px-4 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {modules.filter((m) => m.tier_id === selectedTier).map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  selectedModule === m.id ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700 bg-slate-800/50"
                }`}
              >
                <button
                  onClick={() => setSelectedModule(selectedModule === m.id ? null : m.id)}
                  className="flex-1 text-left"
                >
                  <span className="font-medium">{m.title}</span>
                  {m.outcome && <span className="ml-2 text-sm text-slate-400">— {m.outcome}</span>}
                </button>
                <button onClick={() => deleteModule(m.id)} className="text-xs text-red-400 hover:underline">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedModule && (
        <section>
          <h2 className="mb-4 text-lg font-medium text-white">
            Content in {modules.find((m) => m.id === selectedModule)?.title}
          </h2>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowContentForm(true)}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500"
            >
              + Add content
            </button>
          </div>

          {showContentForm && (
            <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h3 className="mb-3 text-sm font-medium">New content block</h3>
              <div className="grid gap-3">
                <div className="flex gap-2">
                  <input
                    placeholder="kind (lesson, checklist, etc.)"
                    value={contentForm.kind ?? ""}
                    onChange={(e) => setContentForm({ ...contentForm, kind: e.target.value })}
                    className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="title"
                    value={contentForm.title ?? ""}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  placeholder="content (markdown or HTML)"
                  value={contentForm.content ?? ""}
                  onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                  rows={8}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm"
                />
                <input
                  placeholder="media (JSON array of {url, type, alt})"
                  value={contentForm.mediaStr ?? JSON.stringify(contentForm.media ?? [], null, 2)}
                  onChange={(e) => setContentForm({ ...contentForm, mediaStr: e.target.value })}
                  className="rounded border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveContent} className="rounded bg-amber-600 px-4 py-2 text-sm text-white">
                  Save
                </button>
                <button onClick={() => setShowContentForm(false)} className="rounded bg-slate-700 px-4 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {content.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{c.title || c.kind}</span>
                  <button onClick={() => deleteContent(c.id)} className="text-xs text-red-400 hover:underline">
                    Delete
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-sm text-slate-300">
                  {c.content ? (
                    <div dangerouslySetInnerHTML={{ __html: c.content.slice(0, 200) + (c.content.length > 200 ? "…" : "") }} />
                  ) : (
                    <span className="text-slate-500">(no content)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
