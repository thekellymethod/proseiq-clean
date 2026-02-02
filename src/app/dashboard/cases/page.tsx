"use client";

import React from "react";

type CaseRow = {
  id: string;
  title: string;
  created_at?: string;
  status?: string;
};

export default function CasesPage() {
  const [cases, setCases] = React.useState<CaseRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to fetch cases");
      }
      const data = await res.json();
      setCases(Array.isArray(data?.cases) ? data.cases : []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  }

  async function createCase() {
    setError(null);
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Failed to create case");
      return;
    }

    setTitle("");
    await load();
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Cases</h1>

      <div className="mt-4 flex gap-2">
        <input
          className="border rounded-md px-3 py-2 w-full max-w-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New case title…"
        />
        <button className="border rounded-md px-3 py-2" onClick={createCase}>
          Create
        </button>
      </div>

      {error ? (
        <div className="mt-4 text-sm text-red-600 border border-red-200 rounded-md p-3">
          {error}
        </div>
      ) : null}

      <div className="mt-6 border rounded-xl p-4">
        {loading ? (
          <div className="text-sm opacity-70">Loading…</div>
        ) : cases.length === 0 ? (
          <div className="text-sm opacity-70">No cases yet.</div>
        ) : (
          <ul className="space-y-2">
            {cases.map((c) => (
              <li key={c.id} className="border rounded-md p-3">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs opacity-70">
                  {c.status ?? "active"} • {c.created_at ?? ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
!