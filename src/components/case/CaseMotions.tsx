//src/components/case/CaseMotions.tsx
"use client";

import React from "react";

type Motion = {
  id: string;
  name: string;
  purpose: string;
  status: "idea" | "drafting" | "ready" | "filed";
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function CaseMotions({
  caseId,
  readOnly,
}: {
  caseId: string;
  readOnly?: boolean;
}) {
  const [motions, setMotions] = React.useState<Motion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [status, setStatus] = React.useState<Motion["status"]>("idea");
  const [saving, setSaving] = React.useState(false);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/motions`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Failed to load motions");
      setMotions(j.items ?? []);
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
    const n = name.trim();
    if (!n) return;
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/motions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, purpose: purpose.trim() || null, status }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Failed to create motion");
      setMotions((prev) => [j.item as Motion, ...prev]);
      setName("");
      setPurpose("");
      setStatus("idea");
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(motionId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/motions?motion_id=${encodeURIComponent(motionId)}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Failed to delete motion");
      setMotions((prev) => prev.filter((m) => m.id !== motionId));
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div>
        <h3 className="text-white font-semibold">Motions</h3>
        <p className="text-sm text-white/70">
          Plan the procedural battlefield: what you’ll file, why, and when.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-black/10 p-4">
          {loading ? (
            <div className="text-sm text-white/70">Loading…</div>
          ) : motions.length === 0 ? (
            <div className="text-sm text-white/70">No motions yet.</div>
          ) : (
            <ul className="space-y-2">
              {motions.map((m) => (
                <li key={m.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{m.name}</div>
                      <div className="mt-1 text-sm text-white/80">{m.purpose}</div>
                      {!readOnly ? (
                        <button
                          onClick={() => remove(m.id)}
                          className="mt-2 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 hover:bg-black/30"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs text-amber-50">
                      {m.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 text-xs text-white/50">
            Case: <span className="text-white/70">{caseId}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <h4 className="text-white font-medium">Add motion</h4>

          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!readOnly || saving}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="e.g., Motion to Strike"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Purpose</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={!!readOnly || saving}
                className={cx(
                  "w-full min-h-[90px] rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white placeholder:text-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
                placeholder="What are you trying to accomplish procedurally?"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Status</label>
              <select
                title="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!!readOnly || saving}
                className={cx(
                  "w-full rounded-md border px-3 py-2 text-sm",
                  "border-white/10 bg-black/20 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-amber-300/30",
                  readOnly && "opacity-60"
                )}
              >
                <option value="idea">idea</option>
                <option value="drafting">drafting</option>
                <option value="ready">ready</option>
                <option value="filed">filed</option>
              </select>
            </div>

            <button
              onClick={add}
              disabled={!!readOnly || saving}
              className={cx(
                "w-full rounded-md px-3 py-2 text-sm font-medium",
                "border border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/15",
                (readOnly || saving) && "opacity-60"
              )}
            >
              {saving ? "Adding…" : "Add"}
            </button>

            <button
              onClick={refresh}
              disabled={loading}
              className={cx(
                "w-full rounded-md px-3 py-2 text-sm",
                "border border-white/10 bg-black/20 text-white/70 hover:bg-black/30",
                loading && "opacity-60"
              )}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
