"use client";

import React from "react";
import {
  getQuestionById,
  getNextQuestionId,
  getFirstQuestionId,
  setFieldValue,
  getPartyRoleOptions,
  UPDATE_SECTIONS,
  type GuidedQuestion,
} from "./guidedQuestions";
import { emptyIntakeData, hasExistingIntake, type IntakeData } from "./types";
import { useAutosave } from "./useAutosave";
import LegalDefinitions from "./LegalDefinitions";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function AddPartyFullForm({
  data,
  onAdd,
}: {
  data: IntakeData;
  onAdd: (party: { role: string; name: string; email?: string; phone?: string; notes?: string }) => void;
}) {
  const roleOptions = getPartyRoleOptions(data);
  const [role, setRole] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const canSubmit = name.trim().length > 0;
  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <label className="text-xs text-white/70">Party type</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
        >
          <option value="">Select role</option>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-xs text-white/70">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full legal name or company"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs text-white/70">Contact (email)</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@domain.com"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs text-white/70">Contact (phone)</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-5555"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs text-white/70">Demographics / notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Relationship, position, what they did, etc."
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          if (canSubmit) {
            onAdd({ role: role || "other", name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, notes: notes.trim() || undefined });
          }
        }}
        disabled={!canSubmit}
        className="rounded-xl border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-50 disabled:hover:bg-amber-300/12"
      >
        Add party
      </button>
    </div>
  );
}

function getCurrentFieldValue(data: IntakeData, q: GuidedQuestion): string {
  if (q.id === "description_other") {
    const v = (data.basics?.description ?? "");
    return v === "other" ? "" : v;
  }
  if (q.field === "claims") return (data.claims ?? []).join("\n");
  if (q.field === "defenses") return (data.defenses ?? []).join("\n");
  if (q.field === "damages.items") {
    const items = data.damages?.items ?? [];
    return items.map((it) => (it.amount != null ? `${it.label} – ${it.amount}` : it.label)).join("\n");
  }
  if (q.field === "evidence") {
    return (data.evidence ?? []).map((e) => e.label).join("\n");
  }
  const parts = q.field.split(".");
  let v: any = data;
  for (const p of parts) {
    if (v == null) return "";
    const m = p.match(/^(\w+)\[(\d+)\]$/);
    if (m) v = v[m[1]]?.[parseInt(m[2], 10)];
    else v = v[p];
  }
  return v != null ? String(v) : "";
}

type GuidedView = "loading" | "update_prompt" | "section_picker" | "questions" | "review_only";

export default function IntakeGuided({
  caseId,
  onComplete,
}: {
  caseId: string;
  onComplete?: () => void;
}) {
  const [data, setData] = React.useState<IntakeData>(() => emptyIntakeData());
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<GuidedView>("loading");
  const [loaded, setLoaded] = React.useState(false);

  const questionId = currentId ?? getFirstQuestionId();
  const question = getQuestionById(questionId, data);

  const saveFn = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch: data }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? "Failed to save");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save intake.");
    } finally {
      setBusy(false);
    }
  }, [caseId, data]);

  useAutosave(saveFn, data, { debounceMs: 2500, enabled: loaded });

  React.useEffect(() => {
    if (!currentId && view === "questions") setCurrentId(getFirstQuestionId());
  }, [currentId, view]);

  async function load() {
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, { method: "GET" });
      if (!res.ok) return;
      const payload = await res.json().catch(() => ({}));
      const next = payload?.item ?? {};
      if (next && typeof next === "object") {
        const merged = { ...emptyIntakeData(), ...(next as IntakeData) };
        setData(merged);
        setLoaded(true);
        if (hasExistingIntake(merged)) {
          setView("update_prompt");
        } else {
          setView("questions");
          setCurrentId(getFirstQuestionId());
        }
      } else {
        setLoaded(true);
        setView("questions");
        setCurrentId(getFirstQuestionId());
      }
    } catch {
      setLoaded(true);
      setView("questions");
      setCurrentId(getFirstQuestionId());
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch: data }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? "Failed to save");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save intake.");
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/intake/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? "Failed to seed.");
      onComplete?.();
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate.");
    } finally {
      setBusy(false);
    }
  }

  function handleAnswer(value: string | number) {
    if (!question) return;
    const nextData = setFieldValue(data, question.field, value);
    setData(nextData);

    const nextId = getNextQuestionId(questionId, nextData);
    if (nextId) setCurrentId(nextId);
  }

  const value = question ? getCurrentFieldValue(data, question) : "";

  // ---- Loading ----
  if (view === "loading") {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 p-8 text-center text-white/60">
        Loading intake…
      </div>
    );
  }

  // ---- Update prompt: "Are there any recent updates to add?" ----
  if (view === "update_prompt") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-6">
          <div className="text-lg font-medium text-white">Welcome back</div>
          <div className="mt-2 text-sm text-white/70">
            Your case information is saved. Are there any recent updates to add?
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setView("section_picker")}
              className="rounded-xl border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
            >
              Yes, add updates
            </button>
            <button
              type="button"
              onClick={() => setView("review_only")}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80 hover:bg-black/30 hover:text-white"
            >
              No, just view my case
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Section picker: which section to update ----
  if (view === "section_picker") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <div className="text-lg font-medium text-white">Which section would you like to update?</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {UPDATE_SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setCurrentId(s.questionId);
                  setView("questions");
                }}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30 hover:text-white"
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setView("review_only")}
            className="mt-4 text-sm text-white/50 hover:text-white/70"
          >
            Done updating — view summary
          </button>
        </div>
      </div>
    );
  }

  // ---- Review only: summary + save/generate (no full questionnaire) ----
  if (view === "review_only") {
    const totalDamages = data.damages?.items?.reduce((sum, it) => sum + (Number(it.amount) || 0), 0) ?? 0;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
          <div className="text-lg font-medium text-white">Case summary</div>
          <div className="mt-3 grid gap-2 text-sm text-white/80">
            <div><span className="text-white/50">Title:</span> {data.basics?.title ?? "—"}</div>
            <div><span className="text-white/50">Parties:</span> {data.parties?.length ?? 0}</div>
            <div><span className="text-white/50">Claims:</span> {data.claims?.length ?? 0}</div>
            <div><span className="text-white/50">Damages:</span> ${totalDamages.toLocaleString()}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setView("section_picker")}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:bg-black/30"
            >
              Add updates
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="rounded-xl border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => void seed()}
              disabled={busy}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              {busy ? "Working…" : "Generate skeleton"}
            </button>
          </div>
        </div>
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  // ---- Questions flow ----
  if (!question) return null;
  const isReview = question.id === "review";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
        <div className="text-lg font-medium text-white">{question.text}</div>
        {question.subtext ? (
          <div className="mt-1 text-sm text-white/60">{question.subtext}</div>
        ) : null}

        <div className="mt-4">
          {question.inputType === "party_full" ? (
            <AddPartyFullForm
              data={data}
              onAdd={(party) => {
                setData((prev) => setFieldValue(prev, "parties.append", party));
                setCurrentId("add_party_prompt");
              }}
            />
          ) : question.inputType === "select" || question.inputType === "select_or_other" ? (
            <div className="flex flex-wrap gap-2">
              {(question.options ?? []).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAnswer(opt.value)}
                  className={cx(
                    "rounded-xl border px-4 py-2 text-sm transition-colors",
                    value === opt.value
                      ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
                      : "border-white/10 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
              {question.allowOther && (
                <button
                  type="button"
                  onClick={() => handleAnswer("other")}
                  className={cx(
                    "rounded-xl border px-4 py-2 text-sm transition-colors",
                    value === "other"
                      ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
                      : "border-white/10 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white"
                  )}
                >
                  Other (not listed)
                </button>
              )}
              {question.allowIdk && (
                <button
                  type="button"
                  onClick={() => handleAnswer("unknown")}
                  className={cx(
                    "rounded-xl border border-dashed px-4 py-2 text-sm transition-colors",
                    value === "unknown"
                      ? "border-amber-300/40 bg-amber-300/12 text-amber-100"
                      : "border-white/20 bg-black/10 text-white/60 hover:bg-black/20 hover:text-white/80"
                  )}
                >
                  {"I don't know"}
                </button>
              )}
            </div>
          ) : question.inputType === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => setData((prev) => setFieldValue(prev, question.field, e.target.value))}
              onBlur={() => save()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={question.placeholder}
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
              rows={6}
              spellCheck
            />
          ) : question.inputType === "multiline" ? (
            <textarea
              value={value}
              onChange={(e) => setData((prev) => setFieldValue(prev, question.field, e.target.value))}
              onBlur={() => save()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={question.placeholder}
              className="min-h-[140px] w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
              rows={8}
              spellCheck
            />
          ) : (
            <input
              type={question.inputType === "number" ? "number" : "text"}
              value={value}
              onChange={(e) => setData((prev) => setFieldValue(prev, question.field, e.target.value))}
              onBlur={() => save()}
              placeholder={question.placeholder}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-amber-300/40"
            />
          )}
        </div>

        {!isReview && question.inputType !== "select" && question.inputType !== "party_full" ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                handleAnswer(value);
              }}
              disabled={!value && !question.optional}
              className="rounded-xl border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-50 disabled:hover:bg-amber-300/12"
            >
              Continue
            </button>
          </div>
        ) : null}
      </div>

      {isReview ? (
        <div className="space-y-3">
          {error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="rounded-xl border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save intake"}
            </button>
            <button
              type="button"
              onClick={() => void seed()}
              disabled={busy}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              {busy ? "Working…" : "Generate skeleton (timeline/exhibits/drafts)"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        {questionId === "review" ? (
        <button
          type="button"
          onClick={() => setCurrentId(getFirstQuestionId())}
          className="text-xs text-white/50 hover:text-white/70"
        >
          Start over
        </button>
        ) : null}
      </div>
    </div>
  );
}
