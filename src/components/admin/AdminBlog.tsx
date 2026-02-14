"use client";

import { useEffect, useState } from "react";
import * as api from "./api";

type Pillar = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  topics: string[];
  sort_order: number;
};

type Article = {
  id: string;
  pillar_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  content_rich: unknown;
  media: unknown[];
  published_at: string | null;
  sort_order: number;
};

export default function AdminBlog() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Pillar> & { topicsStr?: string }>({});
  const [articleForm, setArticleForm] = useState<Partial<Article> & { mediaStr?: string }>({});
  const [showPillarForm, setShowPillarForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);

  const loadPillars = async () => {
    const { items } = await api.get<{ items: Pillar[] }>("/blog/pillars");
    setPillars(items);
  };

  const loadArticles = async (pillarId?: string) => {
    const url = pillarId ? `/blog/articles?pillar_id=${pillarId}` : "/blog/articles";
    const { items } = await api.get<{ items: Article[] }>(url);
    setArticles(items);
  };

  useEffect(() => {
    loadPillars()
      .then(() => setLoading(false))
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedPillar) loadArticles(selectedPillar);
    else setArticles([]);
  }, [selectedPillar]);

  const savePillar = async () => {
    const topics = form.topicsStr
      ? form.topicsStr.split("\n").map((s) => s.trim()).filter(Boolean)
      : form.topics ?? [];
    await api.post("/blog/pillars", {
      slug: form.slug,
      title: form.title,
      tagline: form.tagline || null,
      topics,
      sort_order: form.sort_order ?? 0,
    });
    await loadPillars();
    setForm({});
    setShowPillarForm(false);
  };

  const saveArticle = async () => {
    if (!selectedPillar) return;
    let media: unknown[] = [];
    try {
      media = articleForm.mediaStr ? JSON.parse(articleForm.mediaStr) : [];
    } catch {
      media = [];
    }
    await api.post("/blog/articles", {
      pillar_id: selectedPillar,
      slug: articleForm.slug,
      title: articleForm.title,
      excerpt: articleForm.excerpt || null,
      content: articleForm.content || null,
      content_rich: articleForm.content_rich ?? null,
      media,
      published_at: articleForm.published_at || null,
      sort_order: articleForm.sort_order ?? 0,
    });
    await loadArticles(selectedPillar);
    setArticleForm({});
    setShowArticleForm(false);
  };

  const deletePillar = async (id: string) => {
    if (!confirm("Delete this pillar and all its articles?")) return;
    await api.del(`/blog/pillars/${id}`);
    await loadPillars();
    if (selectedPillar === id) setSelectedPillar(null);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await api.del(`/blog/articles/${id}`);
    if (selectedPillar) await loadArticles(selectedPillar);
  };

  if (loading) return <p className="text-slate-400">Loading…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-medium text-white">Blog Pillars</h2>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowPillarForm(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500"
          >
            + Add pillar
          </button>
        </div>

        {showPillarForm && (
          <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h3 className="mb-3 text-sm font-medium">New pillar</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="slug (e.g. procedural-foundations)"
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
              <div className="sm:col-span-2">
                <textarea
                  placeholder="topics (one per line)"
                  value={form.topicsStr ?? form.topics?.join("\n") ?? ""}
                  onChange={(e) => setForm({ ...form, topicsStr: e.target.value })}
                  rows={4}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={savePillar} className="rounded bg-amber-600 px-4 py-2 text-sm text-white">
                Save
              </button>
              <button onClick={() => setShowPillarForm(false)} className="rounded bg-slate-700 px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {pillars.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                selectedPillar === p.id ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700 bg-slate-800/50"
              }`}
            >
              <button
                onClick={() => setSelectedPillar(selectedPillar === p.id ? null : p.id)}
                className="flex-1 text-left"
              >
                <span className="font-medium">{p.title}</span>
                <span className="ml-2 text-slate-400">({p.slug})</span>
              </button>
              <div className="flex gap-2">
                <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline">
                  View
                </a>
                <button onClick={() => deletePillar(p.id)} className="text-xs text-red-400 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedPillar && (
        <section>
          <h2 className="mb-4 text-lg font-medium text-white">
            Articles in {pillars.find((p) => p.id === selectedPillar)?.title}
          </h2>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowArticleForm(true)}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500"
            >
              + Add article
            </button>
          </div>

          {showArticleForm && (
            <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <h3 className="mb-3 text-sm font-medium">New article</h3>
              <div className="grid gap-3">
                <div className="flex gap-2">
                  <input
                    placeholder="slug"
                    value={articleForm.slug ?? ""}
                    onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                    className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="title"
                    value={articleForm.title ?? ""}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="flex-1 rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <input
                  placeholder="excerpt"
                  value={articleForm.excerpt ?? ""}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                />
                <input
                  placeholder="published_at (ISO date or leave empty for draft)"
                  value={articleForm.published_at ?? ""}
                  onChange={(e) => setArticleForm({ ...articleForm, published_at: e.target.value || null })}
                  className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="content (markdown or HTML)"
                  value={articleForm.content ?? ""}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  rows={12}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm"
                />
                <input
                  placeholder="media (JSON array of {url, type, alt})"
                  value={articleForm.mediaStr ?? JSON.stringify(articleForm.media ?? [], null, 2)}
                  onChange={(e) => setArticleForm({ ...articleForm, mediaStr: e.target.value })}
                  className="rounded border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveArticle} className="rounded bg-amber-600 px-4 py-2 text-sm text-white">
                  Save
                </button>
                <button onClick={() => setShowArticleForm(false)} className="rounded bg-slate-700 px-4 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {articles.filter((a) => a.pillar_id === selectedPillar).map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{a.title}</span>
                  <div className="flex gap-2">
                    {a.published_at && (
                      <span className="text-xs text-green-400">Published</span>
                    )}
                    <button onClick={() => deleteArticle(a.id)} className="text-xs text-red-400 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none text-sm text-slate-300">
                  {a.excerpt ? (
                    <p>{a.excerpt}</p>
                  ) : a.content ? (
                    <div dangerouslySetInnerHTML={{ __html: a.content.slice(0, 150) + (a.content.length > 150 ? "…" : "") }} />
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
