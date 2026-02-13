"use client";

import React from "react";
import { listFilings, createFiling, updateFiling, deleteFiling } from "@/lib/filings/client";
import type { Filing, FilingStatus } from "@/lib/filings/types";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseFiling({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [items, setItems] = React.useState<Filing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [court, setCourt] = React.useState("");
  const [status, setStatus] = React.useState<FilingStatus>("draft");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editStatus, setEditStatus] = React.useState<FilingStatus>("draft");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { filings } = await listFilings(caseId);
      setItems(filings ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load filings.");
    } finally {
      setLoading(false);
    }
  }

  async function add() {
    const t = title.trim();
    if (!t) return;
    setError(null);
    try {
      const { filing } = await createFiling(caseId, {
        title: t,
        court: court.trim() || null,
        status,
      });
      setItems((prev) => [filing, ...prev]);
      setTitle("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save filing.");
    }
  }

  async function updateStatus(f: Filing, newStatus: FilingStatus) {
    setError(null);
    try {
      const { filing } = await updateFiling(caseId, f.id, { status: newStatus });
      setItems((prev) => prev.map((x) => (x.id === filing.id ? filing : x)));
      setEditingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update filing.");
    }
  }

  async function remove(f: Filing) {
    if (!confirm("Delete this filing?")) return;
    setError(null);
    try {
      await deleteFiling(caseId, f.id);
      setItems((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete filing.");
    }
  }

  React.useEffect(() => {
    load();
  }, [caseId]);

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Filings</h3>
          <p className="text-sm text-white/70">
            Track pleadings, discovery, motions, and service status.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
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
            <div className="text-sm text-white/70">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-white/70">No filings yet.</div>
          ) : (
            <ul className="space-y-2">
              {items.map((f) => (
                <li key={f.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white">{f.title}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {(f.court ?? "—")} •{" "}
                        {f.filed_on ? new Date(f.filed_on).toLocaleDateString() : "not filed"}
                      </div>
                      {f.notes ? <div className="mt-2 text-sm text-white/80">{f.notes}</div> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {editingId === f.id ? (
                        <>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as FilingStatus)}
                            className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white"
                          >
                            <option value="draft">draft</option>
                            <option value="prepared">prepared</option>
                            <option value="filed">filed</option>
                            <option value="served">served</option>
                            <option value="rejected">rejected</option>
                          </select>
                          <button
                            onClick={() => updateStatus(f, editStatus)}
                            className="rounded-md border border-amber-300/30 px-2 py-1 text-xs text-amber-100 hover:bg-amber-300/20"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs text-amber-50">
                            {f.status}
                          </span>
                          {!readOnly && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(f.id);
                                  setEditStatus(f.status);
                                }}
                                className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(f)}
                                className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/60 hover:bg-red-500/20"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <h4 className="text-white font-medium">Add filing</h4>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="e.g., Motion to Compel"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Court</label>
              <input
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="e.g., County District Court"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FilingStatus)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              >
                <option value="draft">draft</option>
                <option value="prepared">prepared</option>
                <option value="filed">filed</option>
                <option value="served">served</option>
                <option value="rejected">rejected</option>
              </select>
            </div>

            <button
              onClick={add}
              disabled={!!readOnly}
              className={cx(
                "w-full rounded-md px-3 py-2 text-sm font-medium",
                "border border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/15",
                readOnly && "opacity-60"
              )}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
