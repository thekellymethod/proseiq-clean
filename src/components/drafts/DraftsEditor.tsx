"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { DRAFT_TEMPLATES, templateDoc } from "@/lib/draftTemplates";

type Draft = {
  id: string;
  case_id: string;
  title: string;
  content: string | null;
  content_rich?: any | null;
  status: string | null;
  updated_at: string;
  created_at: string;
  template_id?: string | null;
  signature_bucket?: string | null;
  signature_path?: string | null;
  signature_name?: string | null;
  signature_title?: string | null;
};

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function textToDoc(text: string) {
  const raw = String(text ?? "").replace(/\r/g, "");
  const blocks = raw.split(/\n{2,}/).map((b) => b.trimEnd());
  const content = blocks
    .filter((b) => b.length > 0)
    .map((b) => ({
      type: "paragraph",
      content: [{ type: "text", text: b }],
    }));
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export default function DraftsEditor({
  caseId,
  draftId,
}: {
  caseId: string;
  draftId: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState("draft");
  const [templateId, setTemplateId] = React.useState<string>("");
  const [signatureBucket, setSignatureBucket] = React.useState<string>("case-signatures");
  const [signaturePath, setSignaturePath] = React.useState<string>("");
  const [signatureName, setSignatureName] = React.useState<string>("");
  const [signatureTitle, setSignatureTitle] = React.useState<string>("");
  const [sigUploading, setSigUploading] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [contentVersion, setContentVersion] = React.useState(0);
  const [loadedDoc, setLoadedDoc] = React.useState<any | null>(null);

  const initialDocRef = React.useRef<any>({ type: "doc", content: [{ type: "paragraph" }] });
  const suppressUpdateRef = React.useRef(false);

  const load = React.useCallback(async () => {
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      const j = await jsonFetch(`/api/cases/${caseId}/drafts/${draftId}`, { method: "GET" });
      const d: Draft = j.item;
      setDraft(d);
      setTitle(d.title ?? "");
      setStatus((d.status ?? "draft") as any);
      setTemplateId(String(d.template_id ?? ""));
      setSignatureBucket(String((d as any).signature_bucket ?? "case-signatures"));
      setSignaturePath(String((d as any).signature_path ?? ""));
      setSignatureName(String((d as any).signature_name ?? ""));
      setSignatureTitle(String((d as any).signature_title ?? ""));
      const rich = d.content_rich && typeof d.content_rich === "object" ? d.content_rich : null;
      const nextDoc = rich ?? textToDoc(d.content ?? "");
      initialDocRef.current = nextDoc;
      setLoadedDoc(nextDoc);
      setDirty(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }, [caseId, draftId]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "Write here…",
        }),
      ],
      content: initialDocRef.current,
      editorProps: {
        attributes: {
          class:
            "prose prose-invert max-w-none focus:outline-none min-h-[420px] px-3 py-2 text-sm text-white",
        },
      },
      onUpdate() {
        if (suppressUpdateRef.current) return;
        setDirty(true);
        setOk(null);
        setContentVersion((v) => v + 1);
      },
    },
    // When we load a different draft, reset editor content.
    [draftId]
  );

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!editor) return;
    if (!loadedDoc) return;
    // Replace content without setting history/dirty.
    suppressUpdateRef.current = true;
    editor.commands.setContent(loadedDoc);
    suppressUpdateRef.current = false;
    setDirty(false);
  }, [editor, loadedDoc, draftId]);

  async function save(opts?: { silent?: boolean }) {
    setError(null);
    setSaving(true);
    try {
      const rich = editor?.getJSON?.() ?? null;
      const plain = editor?.getText?.({ blockSeparator: "\n\n" }) ?? "";
      const j = await jsonFetch(`/api/cases/${caseId}/drafts/${draftId}`, {
        method: "PATCH",
        body: JSON.stringify({
          patch: {
            title: title.trim() || "Untitled draft",
            // Keep the legacy text column updated for back-compat and export/search fallbacks.
            content: plain,
            content_rich: rich,
            status,
            template_id: templateId || null,
            signature_bucket: signaturePath ? signatureBucket : null,
            signature_path: signaturePath || null,
            signature_name: signatureName.trim() || null,
            signature_title: signatureTitle.trim() || null,
          },
        }),
      });
      setDraft(j.item ?? null);
      setDirty(false);
      setOk(opts?.silent ? "Autosaved." : "Saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
      setTimeout(() => setOk(null), 1200);
    }
  }

  const pdfHref = `/api/cases/${caseId}/drafts/${draftId}/export/pdf`;
  const docxHref = `/api/cases/${caseId}/drafts/${draftId}/export/docx`;

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isSave = (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S");
      if (!isSave) return;
      e.preventDefault();
      if (!saving && !loading) save();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, loading, title, status, contentVersion, editor]);

  React.useEffect(() => {
    if (!dirty) return;
    if (saving || loading) return;
    const t = window.setTimeout(() => {
      if (!saving && !loading) save({ silent: true });
    }, 2500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, title, status, contentVersion, saving, loading]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Draft editor</h3>
          <p className="text-sm text-white/70">
            Word-like editing, autosave, and exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/cases/${caseId}/drafts`)}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
          >
            Back
          </button>
          <a
            href={pdfHref}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
          >
            Export PDF
          </a>
          <a
            href={docxHref}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
          >
            Export DOCX
          </a>
          <button
            onClick={() => save()}
            disabled={saving || loading}
            className={cx(
              "rounded-md border px-3 py-2 text-sm font-medium",
              "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
              (saving || loading) && "opacity-60"
            )}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {dirty ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70">
              Unsaved changes
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 text-sm text-white/60">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs text-white/70">Title</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="Untitled draft"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="draft">draft</option>
                <option value="final">final</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs text-white/70">Court template</label>
              <select
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="">(none)</option>
                {DRAFT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-white/50">
                Pick a starting structure; exports will use a court-friendly style preset.
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                disabled={!templateId || !editor}
                onClick={() => {
                  if (!templateId || !editor) return;
                  editor.commands.setContent(templateDoc(templateId));
                  setDirty(true);
                }}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white/80 hover:bg-black/30",
                  (!templateId || !editor) && "opacity-60"
                )}
              >
                Insert template
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/70">Body</label>
            <div className="w-full rounded-md border border-white/10 bg-black/20">
              {editor ? <EditorContent editor={editor} /> : <div className="min-h-[420px] px-3 py-2 text-sm text-white/60">Loading editor…</div>}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Signature</div>
                <div className="text-xs text-white/60">Upload a signature image for exports (PNG/JPG).</div>
              </div>
              {signaturePath ? (
                <button
                  type="button"
                  onClick={() => {
                    setSignaturePath("");
                    setDirty(true);
                  }}
                  className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-white/70">Name</label>
                <input
                  value={signatureName}
                  onChange={(e) => {
                    setSignatureName(e.target.value);
                    setDirty(true);
                  }}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  placeholder="Signer name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70">Title</label>
                <input
                  value={signatureTitle}
                  onChange={(e) => {
                    setSignatureTitle(e.target.value);
                    setDirty(true);
                  }}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  placeholder="e.g., Plaintiff, Attorney"
                />
              </div>
              <div className="flex items-end">
                <label className={cx("w-full cursor-pointer rounded-md border px-3 py-2 text-sm text-center", "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20", sigUploading && "opacity-60")}>
                  {sigUploading ? "Uploading…" : signaturePath ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/png"
                    className="hidden"
                    disabled={sigUploading}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.currentTarget.value = "";
                      if (!f) return;
                      setError(null);
                      setOk(null);
                      setSigUploading(true);
                      try {
                        const up = await jsonFetch(`/api/cases/${caseId}/drafts/${draftId}/signature/upload`, {
                          method: "POST",
                          body: JSON.stringify({ filename: f.name, mime_type: "image/png" }),
                        });
                        const putRes = await fetch(up.upload?.signedUrl, {
                          method: "PUT",
                          headers: { "Content-Type": "image/png" },
                          body: f,
                        });
                        if (!putRes.ok) {
                          const t = await putRes.text().catch(() => "");
                          throw new Error(`Upload failed (${putRes.status}): ${t.slice(0, 200)}`);
                        }
                        setSignatureBucket(String(up.upload?.bucket ?? "case-signatures"));
                        setSignaturePath(String(up.upload?.path ?? ""));
                        setDirty(true);
                        setOk("Signature uploaded. Save to apply to exports.");
                      } catch (err: any) {
                        setError(err?.message ?? "Upload failed");
                      } finally {
                        setSigUploading(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {signaturePath ? (
              <div className="mt-2 text-xs text-white/50 font-mono truncate">
                {signatureBucket}/{signaturePath}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/55">
            <div>
              Updated: {fmt(draft?.updated_at)} • Created: {fmt(draft?.created_at)}
            </div>
            <button
              onClick={load}
              className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
