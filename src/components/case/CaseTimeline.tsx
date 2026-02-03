"use client";

import React from "react";

type TimelineEvent = {
  id: string;
  date: string; // ISO date
  title: string;
  detail?: string;
  tag?: "deadline" | "hearing" | "filing" | "evidence" | "note";
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseTimeline({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [items, setItems] = React.useState<TimelineEvent[]>([]);
  const [date, setDate] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [tag, setTag] = React.useState<TimelineEvent["tag"]>("note");

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // TODO: GET /api/cases/[caseId]/timeline
    setItems([
      {
        id: "t1",
        date: new Date().toISOString().slice(0, 10),
        title: "Client intake completed",
        detail: "Initial narrative, goals, and key facts captured.",
        tag: "note",
      },
      {
        id: "t2",
        date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
        title: "DTPA notice deadline (target)",
        detail: "Prepare pre-suit notice package and send certified.",
        tag: "deadline",
      },
    ]);
  }, [caseId]);

  function add() {
    setError(null);
    const d = date.trim();
    const t = title.trim();
    if (!d || !t) {
      setError("Date and title are required.");
      return;
    }

    const next: TimelineEvent = {
      id: `t_${Math.random().toString(16).slice(2)}`,
      date: d,
      title: t,
      detail: detail.trim() || undefined,
      tag,
    };

    setItems((prev) => [next, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
    setDate("");
    setTitle("");
    setDetail("");

    // TODO: POST /api/cases/[caseId]/timeline
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Timeline</h3>
          <p className="text-sm text-white/70">Build a procedural + factual chronology.</p>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="text-sm text-white/70">No events yet.</div>
          ) : (
            <ol className="space-y-2">
              {items.map((e) => (
                <li key={e.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-white/60">{e.date}</div>
                      <div className="mt-1 font-medium text-white">{e.title}</div>
                      {e.detail ? <div className="mt-2 text-sm text-white/80">{e.detail}</div> : null}
                    </div>
                    {e.tag ? (
                      <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs text-amber-50">
                        {e.tag}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <h4 className="text-white font-medium">Add event</h4>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              />
            </div>

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
                placeholder="e.g., Vehicle repossessed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as any)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              >
                <option value="note">note</option>
                <option value="deadline">deadline</option>
                <option value="hearing">hearing</option>
                <option value="filing">filing</option>
                <option value="evidence">evidence</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Detail (optional)</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full min-h-[90px] rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="What happened, who said what, what you can prove."
              />
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
