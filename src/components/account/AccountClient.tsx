"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type UserLike = {
  id: string;
  email: string;
  created_at: string | null;
  user_metadata: Record<string, any>;
};

type ConfigStatus = {
  openaiConfigured: boolean;
  serperConfigured: boolean;
  model: string | null;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AccountClient({
  user,
  config,
}: {
  user: UserLike;
  config: ConfigStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [ack, setAck] = React.useState(Boolean(user.user_metadata?.disclaimer_ack_at));
  const [defaultJurisdiction, setDefaultJurisdiction] = React.useState(
    String(user.user_metadata?.default_jurisdiction ?? "")
  );
  const [assistantTone, setAssistantTone] = React.useState(
    String(user.user_metadata?.assistant_tone ?? "balanced")
  );

  async function savePrefs() {
    setBusy(true);
    setOk(null);
    setError(null);
    try {
      const supabase = createClient();
      const payload: any = {
        default_jurisdiction: defaultJurisdiction.trim() || null,
        assistant_tone: assistantTone,
        disclaimer_ack_at: ack ? new Date().toISOString() : null,
      };
      const { error: upErr } = await supabase.auth.updateUser({ data: payload });
      if (upErr) throw upErr;
      setOk("Saved.");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
      window.setTimeout(() => setOk(null), 1400);
    }
  }

  async function signOut() {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign out");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 lg:col-span-1">
        <div className="text-lg font-semibold text-white">Profile</div>
        <div className="mt-3 space-y-2 text-sm text-white/80">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Email</div>
            <div className="mt-1 break-words">{user.email || "—"}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">User ID</div>
            <div className="mt-1 font-mono text-xs break-all text-white/70">{user.id}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Created</div>
            <div className="mt-1">{fmt(user.created_at)}</div>
          </div>
        </div>

        <button
          onClick={signOut}
          disabled={busy}
          className={cx(
            "mt-3 w-full rounded-md border px-3 py-2 text-sm font-medium",
            "border-white/10 bg-black/20 text-white/80 hover:bg-black/30",
            busy && "opacity-60"
          )}
        >
          Sign out
        </button>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
        <div className="text-lg font-semibold text-white">Safety & Preferences</div>
        <p className="mt-1 text-sm text-white/70">
          ProseIQ provides educational assistance. Always verify in primary sources and consult a licensed attorney when possible.
        </p>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
        {ok ? (
          <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {ok}
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium text-white">Acknowledge disclaimer</div>
                <div className="text-xs text-white/60">
                  I understand this app is not a lawyer and I will verify citations and rules.
                </div>
              </div>
            </label>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs text-white/70">Default jurisdiction</label>
              <input
                value={defaultJurisdiction}
                onChange={(e) => setDefaultJurisdiction(e.target.value)}
                placeholder="e.g., Texas, California, US Federal, King County WA"
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
              <div className="text-xs text-white/50">
                V1 is multi-state; this helps the assistant prefer the right rules overlay.
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/70">Assistant tone</label>
              <select
                value={assistantTone}
                onChange={(e) => setAssistantTone(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              >
                <option value="balanced">balanced</option>
                <option value="strict">strict (no rabbit trails)</option>
                <option value="coach">coach (more explanation)</option>
              </select>
            </div>
          </div>

          <button
            onClick={savePrefs}
            disabled={busy}
            className={cx(
              "w-full rounded-md border px-3 py-2 text-sm font-medium",
              "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:bg-amber-300/20",
              busy && "opacity-60"
            )}
          >
            {busy ? "Saving…" : "Save preferences"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">
          <div className="text-sm font-medium text-white">Configuration status</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">OpenAI</div>
              <div className={cx("mt-1 font-medium", config.openaiConfigured ? "text-emerald-200" : "text-amber-200")}>
                {config.openaiConfigured ? "Configured" : "Missing OPENAI_API_KEY"}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Serper</div>
              <div className={cx("mt-1 font-medium", config.serperConfigured ? "text-emerald-200" : "text-amber-200")}>
                {config.serperConfigured ? "Configured" : "Missing SERPER_API_KEY"}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Model</div>
              <div className="mt-1 font-medium text-white/80">{config.model || "default"}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/50">
            Keys are never shown in the UI.
          </div>
        </div>
      </section>
    </div>
  );
}

