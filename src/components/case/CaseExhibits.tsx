//src/components/case/CaseExhibits.tsx
"use client";

import React from "react";

type Exhibit = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  file_id: string | null;
  sort: number;
  page_count: number | null;
  bates_start: number | null;
  bates_end: number | null;
  created_at: string;
};

type FileRow = {
  id: string;
  filename: string;
};

function nextCode(existing: string[]) {
  // expects codes like C-001
  const nums = existing
    .map((c) => {
      const m = c.match(/C-(\d+)/i);
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  const next = (nums[nums.length - 1] ?? 0) + 1;
  return `C-${String(next).padStart(3, "0")}`;
}

export default function CaseExhibits({ caseId }: { caseId: string }) {
  const [items, setItems] = React.useState<Exhibit[]>([]);
  const [files, setFiles] = React.useState<FileRow[]>([]);
  const [busy, setBusy] = React.useState(false);

  const [code, setCode] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fileId, setFileId] = React.useState<string>("");

  async function load() {
    const [x, f] = await Promise.all([
      fetch(`/api/cases/${caseId}/exhibits`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/cases/${caseId}/files`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    setItems(x.items ?? []);
    setFiles((f.items ?? []).map((r: any) => ({ id: r.id, filename: r.filename })));
  }

  React.useEffect(() => {
    load();
  }, [caseId]);

  React.useEffect(() => {
    // auto-suggest code when list loads
    if (!code && items.length >= 0) {
      const proposed = nextCode(items.map((i) => i.code));
      setCode(proposed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  async function add() {
    setBusy(true);
    await fetch(`/api/cases/${caseId}/exhibits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
        title: title.trim(),
        description: description.trim() || null,
        file_id: fileId || null,
        sort: items.length ? Math.max(...items.map((i) => i.sort)) + 10 : 10,
      }),
    });
    setBusy(false);
    setTitle("");
    setDescription("");
    setFileId("");
    setCode(""); // regenerate
    await load();
  }

  async function update(exhibitId: string, patch: any) {
    await fetch(`/api/cases/${caseId}/exhibits?exhibitId=${exhibitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  }

  async function remove(exhibitId: string) {
    if (!confirm("Delete this exhibit label?")) return;
    await fetch(`/api/cases/${caseId}/exhibits?exhibitId=${exhibitId}`, { method: "DELETE" });
    await load();
  }

  async function move(exhibitId: string, dir: -1 | 1) {
    // Up/down reorder without drag libs.
    const idx = items.findIndex((x) => x.id === exhibitId);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const next = [...items];
    const a = next[idx];
    const b = next[swapIdx];

    // swap sort values
    const tmp = a.sort;
    a.sort = b.sort;
    b.sort = tmp;

    setItems(next);

    // persist full ordering
    const order = next
      .slice()
      .sort((x, y) => x.sort - y.sort)
      .map((x, i) => ({ id: x.id, sort: (i + 1) * 10 }));

    await fetch(`/api/cases/${caseId}/exhibits/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });

    await load();
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">Exhibits</h3>
          <p className="text-sm text-white/70">Label evidence as C-### and bind to uploaded files. Bates updates on bundle runs.</p>
        </div>
        <button
          onClick={load}
          className="rounded-md border border-white/10 bg-black/10 px-3 py-2 text-sm text-white/80 hover:bg-black/20"
          data-testid="exhibits-refresh"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          {items.length === 0 ? (
            <div className="text-sm text-white/60">No exhibits yet.</div>
          ) : (
            items
              .slice()
              .sort((a, b) => a.sort - b.sort)
              .map((x, idx) => (
                <div key={x.id} className="rounded-lg border border-white/10 bg-black/10 p-3" data-testid={`exhibit-row-${x.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-white">{x.code}</div>
                        <input
                          className="flex-1 min-w-[200px] rounded bg-black/20 px-2 py-1 text-sm text-white"
                          value={x.title}
                          onChange={(e) => {
                            const v = e.target.value;
                            setItems((prev) => prev.map((p) => (p.id === x.id ? { ...p, title: v } : p)));
                          }}
                          onBlur={() => update(x.id, { title: x.title })}
                          placeholder="Title"
                          data-testid={`exhibit-title-${x.id}`}
                        />
                      </div>

                      <textarea
                        className="mt-2 w-full rounded bg-black/20 p-2 text-xs text-white placeholder:text-white/40"
                        value={x.description ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setItems((prev) => prev.map((p) => (p.id === x.id ? { ...p, description: v } : p)));
                        }}
                        onBlur={() => update(x.id, { description: (x.description ?? "").trim() || null })}
                        placeholder="Description (optional)"
                        data-testid={`exhibit-desc-${x.id}`}
                      />

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <select
                          className="rounded bg-black/20 px-2 py-1 text-xs text-white"
                          value={x.file_id ?? ""}
                          onChange={(e) => update(x.id, { file_id: e.target.value || null })}
                          data-testid={`exhibit-file-${x.id}`}
                        >
                          <option value="">(no file linked)</option>
                          {files.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.filename}
                            </option>
                          ))}
                        </select>

                        <div className="text-xs text-white/60">
                          Bates:{" "}
                          {x.bates_start && x.bates_end ? (
                            <span className="text-white/80">
                              {x.bates_start}–{x.bates_end} ({x.page_count ?? "?"} pages)
                            </span>
                          ) : (
                            <span className="text-white/40">—</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => move(x.id, -1)}
                        disabled={idx === 0}
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10 disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        onClick={() => move(x.id, 1)}
                        disabled={idx === items.length - 1}
                        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10 disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        onClick={() => remove(x.id)}
                        className="rounded border border-red-400/30 bg-red-500/10 px-2 py-1 text-xs text-red-100 hover:bg-red-500/15"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <h4 className="text-white font-medium">Add exhibit</h4>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Code</label>
              <input
                className="w-full rounded bg-black/20 px-2 py-2 text-sm text-white"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="C-001"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Title</label>
              <input
                className="w-full rounded bg-black/20 px-2 py-2 text-sm text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bank statement showing reversal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Description</label>
              <textarea
                className="w-full min-h-[90px] rounded bg-black/20 p-2 text-sm text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What it is, why it matters, authentication notes."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Link file (optional)</label>
              <select
                className="w-full rounded bg-black/20 px-2 py-2 text-sm text-white"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
              >
                <option value="">(none)</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.filename}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={add}
              disabled={busy}
              className="w-full rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-50 hover:bg-amber-300/15 disabled:opacity-60"
              data-testid="exhibit-add"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
