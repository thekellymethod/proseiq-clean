"use client";

import React from "react";

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70">{label}</label>
      {children}
    </div>
  );
}

export default function CaseBasicsStep({ caseId }: { caseId: string }) {
  const [state, setState] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const j = await jsonFetch(`/api/cases/${caseId}/intake`, { method: "GET" });
        setState(j.item ?? {});
      } catch (e: any) {
        setError(e?.message ?? "Failed");
      }
    })();
  }, [caseId]);

  async function save(patch: any) {
    setError(null);
    setSaving(true);
    try {
      const next = { ...(state ?? {}), ...patch };
      setState(next);
      await jsonFetch(`/api/cases/${caseId}/intake`, { method: "PATCH", body: JSON.stringify({ patch }) });
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <div className="text-sm font-semibold text-white">Case basics</div>
      <div className="mt-1 text-xs text-white/60">Venue, posture, and core identifiers.</div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Field label="Court / forum">
          <input
            value={state?.court_name ?? ""}
            onChange={(e) => save({ court_name: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="e.g., County Court at Law No. 2"
          />
        </Field>

        <Field label="Jurisdiction">
          <input
            value={state?.jurisdiction ?? ""}
            onChange={(e) => save({ jurisdiction: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="e.g., Texas • Dallas County"
          />
        </Field>

        <Field label="Case number">
          <input
            value={state?.case_number ?? ""}
            onChange={(e) => save({ case_number: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="e.g., DC-24-01234"
          />
        </Field>

        <Field label="Judge / arbitrator (optional)">
          <input
            value={state?.judge_name ?? ""}
            onChange={(e) => save({ judge_name: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="e.g., Hon. ____"
          />
        </Field>

        <Field label="Posture / stage">
          <select
            value={state?.posture ?? "intake"}
            onChange={(e) => save({ posture: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="intake">intake</option>
            <option value="pre_suit">pre-suit</option>
            <option value="filed">filed</option>
            <option value="discovery">discovery</option>
            <option value="motion_practice">motion practice</option>
            <option value="trial">trial/hearing</option>
            <option value="post_judgment">post-judgment</option>
            <option value="arbitration">arbitration</option>
          </select>
        </Field>

        <Field label="Short theory (one sentence)">
          <input
            value={state?.theory_short ?? ""}
            onChange={(e) => save({ theory_short: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="e.g., Defendant misrepresented X, causing Y damages."
          />
        </Field>
      </div>

      <div className="mt-4 text-xs text-white/50">Autosave is active. {saving ? "Saving…" : "Saved."}</div>
    </section>
  );
}
