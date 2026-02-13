//src/components/case/CaseTimeline.tsx
"use client";

import React from "react";

type Event = {
  id: string;
  event_at: string;
  title: string;
  notes?: string | null;
  kind?: string;
};

function isOverdue(iso: string) {
  return new Date(iso).getTime() < Date.now();
}
function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function CaseTimeline({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<Event[]>([]);
  const [event_at, setEventAt] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [kind, setKind] = React.useState("note");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/cases/${caseId}/events`, { cache: "no-store" });
    const j = await res.json();
    setItems(j.items ?? j.events ?? []);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function add() {
    const eventAtIso = event_at ? new Date(event_at).toISOString() : "";
    const res = await fetch(`/api/cases/${caseId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_at: eventAtIso, title, kind, notes: notes || null }),
    });
    const j = await res.json();
    if (res.ok) {
      setItems((p) => [...p, j.item].sort((a, b) => (a.event_at < b.event_at ? -1 : 1)));
      setEventAt("");
      setTitle("");
      setNotes("");
    }
  }

  async function saveEdit(e: Event) {
    setBusyId(e.id);
    const res = await fetch(`/api/cases/${caseId}/events/${encodeURIComponent(e.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_at: e.event_at, title: e.title, kind: e.kind, notes: e.notes }),
    });
    const j = await res.json();
    if (res.ok) {
      setItems((p) => p.map((x) => (x.id === e.id ? j.item : x)));
      setEditingId(null);
    }
    setBusyId(null);
  }

  async function del(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/cases/${caseId}/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) setItems((p) => p.filter((x) => x.id !== id));
    setBusyId(null);
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">Timeline</h3>
          <p className="text-sm text-white/70">Deadlines + procedural history</p>
        </div>
        <button onClick={load} className="rounded border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/80 hover:bg-black/20">
          Refresh
        </button>
      </div>

      <ol className="mt-4 space-y-2">
        {items.map((e) => {
          const overdue = e.kind === "deadline" && isOverdue(e.event_at);
          const isEditing = editingId === e.id;

          return (
            <li
              key={e.id}
              className={[
                "rounded border p-3",
                overdue ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-black/10",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-white/60">{fmt(e.event_at)}</div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <input
                        className="w-full rounded bg-black/20 p-2 text-white"
                        value={e.title}
                        onChange={(ev) =>
                          setItems((p) => p.map((x) => (x.id === e.id ? { ...x, title: ev.target.value } : x)))
                        }
                      />
                      <select
                        className="w-full rounded bg-black/20 p-2 text-white"
                        value={e.kind ?? "note"}
                        onChange={(ev) =>
                          setItems((p) => p.map((x) => (x.id === e.id ? { ...x, kind: ev.target.value } : x)))
                        }
                      >
                        <option>note</option>
                        <option>deadline</option>
                        <option>hearing</option>
                        <option>filing</option>
                        <option>evidence</option>
                      </select>
                      <input
                        className="w-full rounded bg-black/20 p-2 text-white"
                        value={e.event_at.slice(0, 16)}
                        onChange={(ev) =>
                          setItems((p) =>
                            p.map((x) =>
                              x.id === e.id ? { ...x, event_at: new Date(ev.target.value).toISOString() } : x
                            )
                          )
                        }
                        type="datetime-local"
                      />
                      <textarea
                        className="w-full rounded bg-black/20 p-2 text-white"
                        value={e.notes ?? ""}
                        onChange={(ev) =>
                          setItems((p) => p.map((x) => (x.id === e.id ? { ...x, notes: ev.target.value } : x)))
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="mt-1 font-medium text-white">{e.title}</div>
                      {e.notes && <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{e.notes}</div>}
                    </>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs text-amber-50">
                    {e.kind ?? "note"}
                  </span>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          disabled={busyId === e.id}
                          onClick={() => saveEdit(e)}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(e.id)}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          disabled={busyId === e.id}
                          onClick={() => del(e.id)}
                          className="rounded border border-red-400/30 bg-red-500/10 px-2 py-1 text-xs text-red-100 hover:bg-red-500/15"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {overdue ? <span className="text-xs text-red-100">OVERDUE</span> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
        <h4 className="font-medium text-white">Add event</h4>
        <div className="mt-3 space-y-2">
          <input type="datetime-local" value={event_at} onChange={(e) => setEventAt(e.target.value)} className="w-full rounded bg-black/20 p-2 text-white" />
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded bg-black/20 p-2 text-white" />
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full rounded bg-black/20 p-2 text-white">
            <option>note</option>
            <option>deadline</option>
            <option>hearing</option>
            <option>filing</option>
            <option>evidence</option>
          </select>
          <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded bg-black/20 p-2 text-white" />
          <button onClick={add} className="w-full rounded bg-amber-300/20 p-2 text-amber-100">Add</button>
        </div>
      </div>
    </section>
  );
}
