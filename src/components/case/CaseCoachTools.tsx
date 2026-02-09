"use client";

import React from "react";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
  return j;
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="font-medium text-white">{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-white/60">{subtitle}</div> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function CaseCoachTools({ caseId }: { caseId: string }) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  // Witness
  const [witnessName, setWitnessName] = React.useState("");
  const [witnessPurpose, setWitnessPurpose] = React.useState("");
  const [witnessFacts, setWitnessFacts] = React.useState("");

  // Cross-exam
  const [crossName, setCrossName] = React.useState("");
  const [crossGoals, setCrossGoals] = React.useState("Impeach credibility; lock in timeline; show inconsistency");
  const [crossExpected, setCrossExpected] = React.useState("");
  const [crossImpeach, setCrossImpeach] = React.useState("");

  // Subpoena
  const [subTarget, setSubTarget] = React.useState("");
  const [subPurpose, setSubPurpose] = React.useState("");
  const [subCats, setSubCats] = React.useState("Emails; contracts; invoices; account statements; call logs");
  const [subRange, setSubRange] = React.useState("");

  // Motions/deadlines
  const [motionGoal, setMotionGoal] = React.useState("Narrow issues; force disclosure; enforce deadlines; exclude evidence");
  const [motionStage, setMotionStage] = React.useState("discovery");

  async function run(kind: string, url: string, body: any) {
    setBusy(kind);
    setError(null);
    setResult(null);
    try {
      const j = await jsonFetch(url, { method: "POST", body: JSON.stringify(body) });
      setResult(j.item ?? j);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <h3 className="text-white font-semibold">Coach tools</h3>
        <p className="mt-1 text-sm text-white/70">
          Generate structured playbooks. Verify against local rules and primary sources.
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Section
          title="Witness testimony prep"
          subtitle="Direct exam outline + prep checklist + exhibit readiness."
        >
          <div className="grid gap-2">
            <input
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              placeholder="Witness name"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <input
              value={witnessPurpose}
              onChange={(e) => setWitnessPurpose(e.target.value)}
              placeholder="Purpose (what must this witness prove?)"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <textarea
              value={witnessFacts}
              onChange={(e) => setWitnessFacts(e.target.value)}
              placeholder="Known facts (optional)"
              className="w-full min-h-[110px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <button
              disabled={busy !== null || !witnessName.trim() || !witnessPurpose.trim()}
              onClick={() =>
                run("witness", `/api/cases/${caseId}/coach/witness`, {
                  witnessName: witnessName.trim(),
                  purpose: witnessPurpose.trim(),
                  facts: witnessFacts.trim() || undefined,
                })
              }
              className={cx(
                "w-full rounded-md border px-3 py-2 text-sm font-medium",
                "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
                (busy !== null || !witnessName.trim() || !witnessPurpose.trim()) && "opacity-60"
              )}
            >
              {busy === "witness" ? "Generating…" : "Generate"}
            </button>
          </div>
        </Section>

        <Section
          title="Cross-examination plan"
          subtitle="Leading-question chapters + impeachment plan."
        >
          <div className="grid gap-2">
            <input
              value={crossName}
              onChange={(e) => setCrossName(e.target.value)}
              placeholder="Witness name"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <textarea
              value={crossGoals}
              onChange={(e) => setCrossGoals(e.target.value)}
              placeholder="Goals (one per line)"
              className="w-full min-h-[80px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <textarea
              value={crossExpected}
              onChange={(e) => setCrossExpected(e.target.value)}
              placeholder="Expected testimony (optional)"
              className="w-full min-h-[80px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <textarea
              value={crossImpeach}
              onChange={(e) => setCrossImpeach(e.target.value)}
              placeholder="Impeachment materials (one per line) (optional)"
              className="w-full min-h-[70px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <button
              disabled={busy !== null || !crossName.trim()}
              onClick={() =>
                run("cross", `/api/cases/${caseId}/coach/cross-exam`, {
                  witnessName: crossName.trim(),
                  goals: crossGoals
                    .split(/\n+/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                  expectedTestimony: crossExpected.trim() || undefined,
                  impeachmentMaterials: crossImpeach
                    .split(/\n+/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className={cx(
                "w-full rounded-md border px-3 py-2 text-sm font-medium",
                "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
                (busy !== null || !crossName.trim()) && "opacity-60"
              )}
            >
              {busy === "cross" ? "Generating…" : "Generate"}
            </button>
          </div>
        </Section>

        <Section
          title="Subpoena duces tecum planner"
          subtitle="Checklist + narrowly tailored categories (not form text)."
        >
          <div className="grid gap-2">
            <input
              value={subTarget}
              onChange={(e) => setSubTarget(e.target.value)}
              placeholder="Target custodian (person/org)"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <input
              value={subPurpose}
              onChange={(e) => setSubPurpose(e.target.value)}
              placeholder="Purpose"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <input
              value={subRange}
              onChange={(e) => setSubRange(e.target.value)}
              placeholder="Time range (optional)"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <textarea
              value={subCats}
              onChange={(e) => setSubCats(e.target.value)}
              placeholder="Categories (one per line or semicolon-separated)"
              className="w-full min-h-[80px] rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <button
              disabled={busy !== null || !subTarget.trim() || !subPurpose.trim()}
              onClick={() =>
                run("subpoena", `/api/cases/${caseId}/coach/subpoena`, {
                  target: subTarget.trim(),
                  purpose: subPurpose.trim(),
                  timeRange: subRange.trim() || undefined,
                  categories: subCats
                    .split(/[\n;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className={cx(
                "w-full rounded-md border px-3 py-2 text-sm font-medium",
                "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
                (busy !== null || !subTarget.trim() || !subPurpose.trim()) && "opacity-60"
              )}
            >
              {busy === "subpoena" ? "Generating…" : "Generate"}
            </button>
          </div>
        </Section>

        <Section
          title="Motions + deadline watchlist"
          subtitle="Common motions, when they may apply, and what to check in local rules."
        >
          <div className="grid gap-2">
            <input
              value={motionGoal}
              onChange={(e) => setMotionGoal(e.target.value)}
              placeholder="Goal"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            />
            <select
              value={motionStage}
              onChange={(e) => setMotionStage(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            >
              <option value="pleadings">pleadings</option>
              <option value="discovery">discovery</option>
              <option value="pretrial">pretrial</option>
              <option value="trial">trial</option>
              <option value="post-judgment">post-judgment</option>
            </select>
            <button
              disabled={busy !== null || !motionGoal.trim()}
              onClick={() =>
                run("motions", `/api/cases/${caseId}/coach/motions`, {
                  goal: motionGoal.trim(),
                  currentStage: motionStage,
                })
              }
              className={cx(
                "w-full rounded-md border px-3 py-2 text-sm font-medium",
                "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
                (busy !== null || !motionGoal.trim()) && "opacity-60"
              )}
            >
              {busy === "motions" ? "Generating…" : "Generate"}
            </button>
          </div>
        </Section>
      </div>

      {result ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
          <div className="text-sm font-medium text-white">Latest output</div>
          <pre className="mt-2 max-h-[420px] overflow-auto rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/80">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}

