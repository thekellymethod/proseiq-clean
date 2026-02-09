"use client";

import React from "react";

type IntakeShape = {
  claims?: string[];
  defenses?: string[];
  causes_of_action?: string[];
  requested_relief?: string;
  jurisdiction_notes?: string;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function splitLines(s: string) {
  return uniq(
    s
      .split(/\r?\n|,/g)
      .map((x) => x.trim())
      .filter(Boolean)
  );
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export default function ClaimsDefensesStep({ caseId }: { caseId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const [claimsText, setClaimsText] = React.useState("");
  const [defensesText, setDefensesText] = React.useState("");
  const [causesText, setCausesText] = React.useState("");
  const [relief, setRelief] = React.useState("");
  const [jurisdiction, setJurisdiction] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, { cache: "no-store" });
      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error || `Failed to load intake (${res.status})`;
        throw new Error(msg);
      }

      const intake: IntakeShape = data?.intake ?? data ?? {};
      setClaimsText((intake.claims ?? []).join("\n"));
      setDefensesText((intake.defenses ?? []).join("\n"));
      setCausesText((intake.causes_of_action ?? []).join("\n"));
      setRelief(intake.requested_relief ?? "");
      setJurisdiction(intake.jurisdiction_notes ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Failed to load intake.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError(null);
    setOk(null);

    const payload: IntakeShape = {
      claims: splitLines(claimsText),
      defenses: splitLines(defensesText),
      causes_of_action: splitLines(causesText),
      requested_relief: relief.trim() || "",
      jurisdiction_notes: jurisdiction.trim() || "",
    };

    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?.error || `Failed to save (${res.status})`;
        throw new Error(msg);
      }

      setOk("Saved.");
      // normalize display after save
      setClaimsText((payload.claims ?? []).join("\n"));
      setDefensesText((payload.defenses ?? []).join("\n"));
      setCausesText((payload.causes_of_action ?? []).join("\n"));
    } catch (e: any) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
      setTimeout(() => setOk(null), 1500);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-white font-semibold">Claims & defenses</div>
            <div className="text-sm text-white/60">
              Put each item on its own line. Commas also work. Keep it blunt and specific.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading || saving}
              className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30 disabled:opacity-60"
            >
              Refresh
            </button>
            <button
              onClick={save}
              disabled={loading || saving}
              className="rounded-md border border-amber-300/30 bg-amber-300/12 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {ok ? (
          <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2 text-sm text-emerald-100">
            {ok}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Claims (what you assert)</div>
          <textarea
            value={claimsText}
            onChange={(e) => setClaimsText(e.target.value)}
            rows={10}
            placeholder={`Examples:\n- Breach of contract\n- FCRA: inaccurate reporting\n- Negligent misrepresentation`}
            className={cx(
              "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
              "focus:border-amber-300/30"
            )}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Defenses (what you expect they’ll argue)</div>
          <textarea
            value={defensesText}
            onChange={(e) => setDefensesText(e.target.value)}
            rows={10}
            placeholder={`Examples:\n- Statute of limitations\n- Failure to mitigate\n- Lack of standing\n- Arbitration clause`}
            className={cx(
              "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
              "focus:border-amber-300/30"
            )}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Causes of action (optional: statutes / torts)</div>
          <textarea
            value={causesText}
            onChange={(e) => setCausesText(e.target.value)}
            rows={7}
            placeholder={`Examples:\n- Fair Credit Reporting Act (15 U.S.C. § 1681)\n- Texas DTPA\n- Conversion`}
            className={cx(
              "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
              "focus:border-amber-300/30"
            )}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white">Requested relief</div>
          <textarea
            value={relief}
            onChange={(e) => setRelief(e.target.value)}
            rows={7}
            placeholder={`Examples:\n- Actual damages\n- Statutory damages\n- Injunctive relief\n- Fees/costs`}
            className={cx(
              "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
              "focus:border-amber-300/30"
            )}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-medium text-white">Jurisdiction / venue notes (optional)</div>
        <textarea
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          rows={4}
          placeholder="Where filed, why venue is proper, arbitration forum, governing law clause, etc."
          className={cx(
            "mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none",
            "focus:border-amber-300/30"
          )}
        />
      </div>

      {loading ? (
        <div className="text-sm text-white/60">Loading intake…</div>
      ) : null}
    </div>
  );
}
