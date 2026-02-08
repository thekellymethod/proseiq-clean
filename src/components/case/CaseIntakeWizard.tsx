
"use client";

import React from "react";
import { useRouter } from "next/navigation";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type Party = {
  id: string;
  role: "plaintiff" | "defendant" | "respondent" | "petitioner" | "witness" | "other";
  name: string;
  notes?: string | null;
};

const ROLES: Party["role"][] = ["plaintiff", "defendant", "petitioner", "respondent", "witness", "other"];

type Intake = {
  forum: "Court" | "Arbitration" | "Administrative" | "Other";
  jurisdiction: string;
  venue: string;
  matter_type: string;
  case_number: string;
  judge_arbitrator: string;
  opposing_counsel: string;
  goals: string;
  facts: string;
  damages: string;
  relief: string;
};

const DEFAULT_INTAKE: Intake = {
  forum: "Court",
  jurisdiction: "",
  venue: "",
  matter_type: "General",
  case_number: "",
  judge_arbitrator: "",
  opposing_counsel: "",
  goals: "",
  facts: "",
  damages: "",
  relief: "",
};

export default function CaseIntakeWizard({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  const [intake, setIntake] = React.useState<Intake>(DEFAULT_INTAKE);
  const [parties, setParties] = React.useState<Party[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newRole, setNewRole] = React.useState<Party["role"]>("defendant");
  const [newName, setNewName] = React.useState("");
  const [newNotes, setNewNotes] = React.useState("");

  async function load() {
    const [i, p] = await Promise.all([
      fetch(`/api/cases/${caseId}/intake`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/cases/${caseId}/parties`, { cache: "no-store" }).then((r) => r.json()),
    ]);

    if (i?.item) setIntake({ ...DEFAULT_INTAKE, ...(i.item.intake ?? {}) });
    setParties(p.items ?? []);
  }

  React.useEffect(() => {
    load();
  }, [caseId]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField<K extends keyof Intake>(k: K, v: Intake[K]) {
    setIntake((prev) => ({ ...prev, [k]: v }));
  }

  async function saveIntake() {
    setError(null);
    setBusy(true);
    try {
      const r = await fetch(`/api/cases/${caseId}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to save intake.");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function addParty() {
    setError(null);
    if (!newName.trim()) {
      setError("Party name is required.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/cases/${caseId}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, name: newName.trim(), notes: newNotes.trim() || null }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to add party.");
      setNewName("");
      setNewNotes("");
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function removeParty(id: string) {
    if (!confirm("Remove this party?")) return;
    setBusy(true);
    try {
      await fetch(`/api/cases/${caseId}/parties?partyId=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setError(null);
    setBusy(true);
    try {
      await saveIntake();
      const r = await fetch(`/api/cases/${caseId}/seed`, { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to seed case.");

      router.push(`/dashboard/cases/${caseId}`);
      router.refresh();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-white font-semibold">Intake step {step} of 3</div>
            <div className="text-sm text-white/70">Answer at a “good enough” level. You can refine later.</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveIntake}
              disabled={busy}
              className={cx(
                "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10",
                busy && "opacity-60"
              )}
            >
              Save
            </button>
            <button
              onClick={seed}
              disabled={busy}
              className={cx(
                "rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20",
                busy && "opacity-60"
              )}
            >
              Generate workspace
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
        ) : null}

        {step === 1 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Forum</label>
              <select
                value={intake.forum}
                onChange={(e) => setField("forum", e.target.value as any)}
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {["Court", "Arbitration", "Administrative", "Other"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Matter type</label>
              <input
                value={intake.matter_type}
                onChange={(e) => setField("matter_type", e.target.value)}
                placeholder="General"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Jurisdiction</label>
              <input
                value={intake.jurisdiction}
                onChange={(e) => setField("jurisdiction", e.target.value)}
                placeholder="e.g., Texas, Federal, AAA"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Venue / Division</label>
              <input
                value={intake.venue}
                onChange={(e) => setField("venue", e.target.value)}
                placeholder="e.g., Dallas County, Northern District"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Case number (if assigned)</label>
              <input
                value={intake.case_number}
                onChange={(e) => setField("case_number", e.target.value)}
                placeholder="(optional)"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Judge / Arbitrator</label>
              <input
                value={intake.judge_arbitrator}
                onChange={(e) => setField("judge_arbitrator", e.target.value)}
                placeholder="(optional)"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-white/70">Opposing counsel (if known)</label>
              <input
                value={intake.opposing_counsel}
                onChange={(e) => setField("opposing_counsel", e.target.value)}
                placeholder="Name / firm / email (optional)"
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Goals</label>
              <textarea
                value={intake.goals}
                onChange={(e) => setField("goals", e.target.value)}
                placeholder="What outcome are you aiming for?"
                className="w-full min-h-[90px] rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/70">Core facts</label>
              <textarea
                value={intake.facts}
                onChange={(e) => setField("facts", e.target.value)}
                placeholder="A short narrative: who, what, when, where, and what you can prove."
                className="w-full min-h-[140px] rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-white/70">Damages (if any)</label>
                <textarea
                  value={intake.damages}
                  onChange={(e) => setField("damages", e.target.value)}
                  placeholder="Out-of-pocket, refunds, fees, lost wages, etc."
                  className="w-full min-h-[90px] rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70">Relief requested</label>
                <textarea
                  value={intake.relief}
                  onChange={(e) => setField("relief", e.target.value)}
                  placeholder="Dismissal, injunction, money judgment, fees, corrections, etc."
                  className="w-full min-h-[90px] rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-white/70">Add key parties now. You can add more later.</div>

            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70">Name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Person, company, agency"
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-white/70">Notes (optional)</label>
                  <input
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Address, email, agent name, service notes, etc."
                    className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    onClick={addParty}
                    disabled={busy}
                    className={cx(
                      "w-full rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20",
                      busy && "opacity-60"
                    )}
                  >
                    Add party
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {parties.length === 0 ? (
                <div className="text-sm text-white/60">No parties added yet.</div>
              ) : (
                parties.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 p-3">
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium">{p.name}</div>
                      <div className="text-xs text-white/60">
                        {p.role}{p.notes ? ` • ${p.notes}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => removeParty(p.id)}
                      disabled={busy}
                      className="rounded border border-red-400/30 bg-red-500/10 px-2 py-1 text-xs text-red-100 hover:bg-red-500/15 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-50/90">
              When you click <span className="font-semibold">Generate workspace</span>, ProseIQ will seed:
              <ul className="mt-2 list-disc pl-5 text-amber-50/80">
                <li>A neutral procedural timeline (forum-aware).</li>
                <li>An exhibit ladder (C-001 …) ready to link documents.</li>
                <li>Drafting-ready sections inside the case workspace (future: AI-assisted).</li>
              </ul>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            Back
          </button>

          <div className="flex gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
              >
                Next
              </button>
            ) : (
              <button
                onClick={seed}
                disabled={busy}
                className={cx(
                  "rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20",
                  busy && "opacity-60"
                )}
              >
                {busy ? "Generating…" : "Generate workspace"}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-white font-semibold">What this drives</div>
        <div className="mt-2 space-y-3 text-sm text-white/70">
          <div>
            <div className="text-white/80 font-medium">Timeline</div>
            <div>Forum-aware milestones: service, pleadings, discovery, motions, hearings.</div>
          </div>
          <div>
            <div className="text-white/80 font-medium">Documents</div>
            <div>Upload evidence, label exhibits, generate bundles with Bates stamps.</div>
          </div>
          <div>
            <div className="text-white/80 font-medium">Drafting</div>
            <div>Seed drafting sections from your facts/goals (future: AI-assisted).</div>
          </div>
          <div>
            <div className="text-white/80 font-medium">Accountability</div>
            <div>Audit logging + RLS isolates user data per account.</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
