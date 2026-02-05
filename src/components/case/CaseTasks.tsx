"use client";

import React from "react";

type Task = {
  id: string;
  case_id: string;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  kind: string;
  status: string;
  title: string;
  notes: string | null;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function CaseTasks({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [kind, setKind] = React.useState("task");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to load tasks");
      setItems(j.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function add() {
    setError(null);
    if (!title.trim()) return setError("Title is required.");
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          kind,
          notes: notes.trim() || null,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to create task");
      setTitle("");
      setDueAt("");
      setKind("task");
      setNotes("");
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(taskId: string, status: string) {
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId, patch: { status } }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to update");
      setItems((prev) => prev.map((t) => (t.id === taskId ? j.item : t)));
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  }

  async function remove(taskId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks?task_id=${encodeURIComponent(taskId)}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to delete");
      setItems((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Tasks</h3>
          <p className="text-sm text-white/70">
            Turn procedure into checkboxes. Every task should link to an event, a document, or an exhibit.
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-white/60">No tasks yet.</div>
          ) : (
            <ol className="space-y-2">
              {items.map((t) => (
                <li key={t.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                          {t.kind}
                        </span>
                        <span
                          className={cx(
                            "rounded-full border px-2 py-0.5 text-xs",
                            t.status === "done"
                              ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                              : t.status === "blocked"
                              ? "border-red-300/20 bg-red-400/10 text-red-100"
                              : "border-amber-300/20 bg-amber-300/10 text-amber-50"
                          )}
                        >
                          {t.status}
                        </span>
                        {t.due_at ? (
                          <span className="text-xs text-white/55">due {fmt(t.due_at)}</span>
                        ) : null}
                      </div>

                      <div className="mt-2 font-medium text-white truncate">{t.title}</div>
                      {t.notes ? <div className="mt-2 text-sm text-white/70">{t.notes}</div> : null}
                    </div>

                    <div className="shrink-0 flex flex-col gap-2">
                      <select
                        value={t.status}
                        onChange={(e) => setStatus(t.id, e.target.value)}
                        className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white"
                      >
                        <option value="open">open</option>
                        <option value="in_progress">in_progress</option>
                        <option value="done">done</option>
                        <option value="blocked">blocked</option>
                        <option value="canceled">canceled</option>
                      </select>
                      <button
                        onClick={() => remove(t.id)}
                        className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          <h4 className="text-white font-medium">Add task</h4>
          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Type</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="task">task</option>
                <option value="filing">filing</option>
                <option value="discovery">discovery</option>
                <option value="call">call</option>
                <option value="note">note</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="e.g., Draft motion to compel"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Due (optional)</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[90px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="What to do, what you need, and what exhibit(s) it depends on."
              />
            </div>

            <button
              onClick={add}
              disabled={saving}
              className="w-full rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add task"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}