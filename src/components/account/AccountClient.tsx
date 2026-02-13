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

type BillingStatus = {
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  price_id: string | null;
  plan: "basic" | "pro" | null;
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

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AccountClient({
  user,
  config,
  billing,
}: {
  user: UserLike;
  config: ConfigStatus;
  billing: BillingStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const [ack, setAck] = React.useState(Boolean(user.user_metadata?.disclaimer_ack_at));
  const [defaultJurisdiction, setDefaultJurisdiction] = React.useState(
    String(user.user_metadata?.default_jurisdiction ?? "")
  );
  const [assistantTone, setAssistantTone] = React.useState(
    String(user.user_metadata?.assistant_tone ?? "balanced")
  );

  const plan = billing.plan ?? "free";
  const isPaid = plan === "basic" || plan === "pro";
  const renewsDate = fmtDate(billing.current_period_end);

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

  async function startCheckout(planType: "basic" | "pro") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Checkout failed");
      if (json?.url) window.location.href = json.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Portal failed");
      if (json?.url) window.location.href = json.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Portal failed");
      setBusy(false);
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
    <div className="space-y-10">
      {/* 1. Plan & Billing — Top, full width */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white">
              Plan: {plan === "pro" ? "Pro" : plan === "basic" ? "Basic" : "Free"}
            </div>
            {isPaid ? (
              <div className="mt-2 space-y-1 text-sm text-white/80">
                <p>
                  ${plan === "pro" ? "59" : "29"}/month
                  {renewsDate && (
                    <span className="ml-2 text-white/60">· Renews {renewsDate}</span>
                  )}
                </p>
                <p className="text-white/60">
                  Status: {billing.status === "active" || billing.status === "trialing" ? "Active" : (billing.status ?? "Active")}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-white/70">
                Upgrade to Basic or Pro
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isPaid ? (
              <>
                <button
                  onClick={openPortal}
                  disabled={busy}
                  className={cx(
                    "rounded-md border border-amber-300/30 bg-amber-300/12 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
                  )}
                >
                  Manage Billing
                </button>
                <button
                  onClick={openPortal}
                  disabled={busy}
                  className={cx(
                    "rounded-md border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white/80 hover:bg-black/30 disabled:opacity-60"
                  )}
                >
                  Downgrade
                </button>
              </>
            ) : plan === "basic" ? (
              <button
                onClick={() => startCheckout("pro")}
                disabled={busy}
                className={cx(
                  "rounded-md border border-amber-300/30 bg-amber-300/12 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
                )}
              >
                Upgrade to Pro – $59/mo
              </button>
            ) : (
              <>
                <button
                  onClick={() => startCheckout("basic")}
                  disabled={busy}
                  className={cx(
                    "rounded-md border border-emerald-300/30 bg-emerald-300/12 px-4 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-300/20 disabled:opacity-60"
                  )}
                >
                  Basic – $29/mo
                </button>
                <button
                  onClick={() => startCheckout("pro")}
                  disabled={busy}
                  className={cx(
                    "rounded-md border border-amber-300/30 bg-amber-300/12 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
                  )}
                >
                  Pro – $59/mo
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. Preferences */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Assistant & Jurisdiction Settings</h2>
        <p className="mt-2 text-sm text-white/70">
          ProseIQ provides structured legal organization tools. It is not a law firm and does not provide legal advice.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
        {ok ? (
          <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {ok}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
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

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs text-white/70">Default jurisdiction</label>
              <input
                value={defaultJurisdiction}
                onChange={(e) => setDefaultJurisdiction(e.target.value)}
                placeholder="e.g., Texas, California, US Federal"
                className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
              />
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
              "rounded-md border border-amber-300/30 bg-amber-300/12 px-5 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            )}
          >
            {busy ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </section>

      {/* 3. Profile */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-xs text-white/60">Email</div>
            <div className="mt-1 text-sm text-white/90">{user.email || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-white/60">Member since</div>
            <div className="mt-1 text-sm text-white/90">{fmt(user.created_at)}</div>
          </div>

          <details className="group">
            <summary className="cursor-pointer list-none text-xs text-white/50 hover:text-white/70">
              Advanced
            </summary>
            <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">User ID</div>
              <div className="mt-1 font-mono text-xs break-all text-white/70">{user.id}</div>
            </div>
          </details>

          <button
            onClick={signOut}
            disabled={busy}
            className={cx(
              "mt-4 rounded-md border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80 hover:bg-black/30 disabled:opacity-60"
            )}
          >
            Sign out
          </button>
        </div>
      </section>

      {/* 4. System Status — Collapsible */}
      <section className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="text-sm font-medium text-white/80">System Status (Advanced)</span>
          <span className="text-white/50">{advancedOpen ? "▼" : "▶"}</span>
        </button>
        {advancedOpen && (
          <div className="border-t border-white/10 p-4 space-y-3">
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-white/60">OpenAI</div>
                <div className={cx("mt-1 font-medium", config.openaiConfigured ? "text-emerald-200" : "text-amber-200")}>
                  {config.openaiConfigured ? "Configured" : "Missing"}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-white/60">Serper</div>
                <div className={cx("mt-1 font-medium", config.serperConfigured ? "text-emerald-200" : "text-amber-200")}>
                  {config.serperConfigured ? "Configured" : "Missing"}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="text-xs text-white/60">Model</div>
                <div className="mt-1 font-medium text-white/80">{config.model || "default"}</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
