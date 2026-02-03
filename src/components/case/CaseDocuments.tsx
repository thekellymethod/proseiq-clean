"use client";

import React from "react";

type CaseDocument = {
  id: string;
  name: string;
  kind: "evidence" | "pleading" | "correspondence" | "invoice" | "photo" | "other";
  created_at: string;
  note?: string;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseDocuments({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [docs, setDocs] = React.useState<CaseDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<CaseDocument["kind"]>("evidence");
  const [note, setNote] = React.useState("");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      // TODO: Wire to: GET /api/cases/[caseId]/documents
      // const res = await fetch(`/api/cases/${caseId}/documents`, { cache: "no-store" });
      // const data = await res.json();
      // setDocs(data.documents ?? []);
      setDocs([
        {
          id: "doc_1",
          name: "Retail Installment Contract.pdf",
          kind: "evidence",
          created_at: new Date().toISOString(),
          note: "Signed contract and disclosures",
        },
        {
          id: "doc_2",
          name: "Repossession Notice.jpg",
          kind: "photo",
          created_at: new Date().toISOString(),
          note: "Photo of notice left at residence",
        },
      ]);
    } catch (e: any) {
      setError(e?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function addDocument() {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return;

    const nextDoc: CaseDocument = {
      id: `doc_${Math.random().toString(16).slice(2)}`,
      name: trimmed,
      kind,
      note: note.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI
    setDocs((prev) => [nextDoc, ...prev]);
    setName("");
    setNote("");

    try {
      // TODO: Wire to: POST /api/cases/[caseId]/documents
      // await fetch(`/api/cases/${caseId}/documents`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(nextDoc),
      // });
    } catch (e: any) {
      setError(e?.message || "Failed to save document.");
      // rollback
      setDocs((prev) => prev.filter((d) => d.id !== nextDoc.id));
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  return (
    <section className="w-full">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Documents</h2>
          <p className="text-sm text-white/70">
            Evidence, pleadings, notices, invoices — organized and searchable.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          Refresh
        </button>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          {loading ? (
            <div className="text-sm text-white/70">Loading…</div>
          ) : error ? (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-sm text-white/70">No documents yet.</div>
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-white/10 bg-black/10 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white">{d.name}</div>
                      <div className="mt-1 text-xs text-white/60">
                        {d.kind.toUpperCase()} •{" "}
                        {new Date(d.created_at).toLocaleString()}
                      </div>
                      {d.note ? (
                        <div className="mt-2 text-sm text-white/80">{d.note}</div>
                      ) : null}
                    </div>

                    <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs text-amber-100">
                      {d.kind}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h3 className="font-medium text-white">Add document</h3>
          <p className="mt-1 text-sm text-white/70">
            For now, this creates metadata. Next we wire file upload to Supabase Storage.
          </p>

          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="e.g., Demand Letter.pdf"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Type</label>
              <select
                title="Type"
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                disabled={!!readOnly}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              >
                <option value="evidence">evidence</option>
                <option value="pleading">pleading</option>
                <option value="correspondence">correspondence</option>
                <option value="invoice">invoice</option>
                <option value="photo">photo</option>
                <option value="other">other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!!readOnly}
                className={cx(
                  "w-full min-h-[90px] rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="Why this matters; what it proves."
              />
            </div>

            <button
              onClick={addDocument}
              disabled={!!readOnly}
              className={cx(
                "w-full rounded-md px-3 py-2 text-sm font-medium",
                "border border-amber-300/30 bg-amber-300/10 text-amber-50",
                "hover:bg-amber-300/15",
                readOnly && "opacity-60"
              )}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-white/50">
        Case: <span className="text-white/70">{caseId}</span>
      </div>
    </section>
  );
}
