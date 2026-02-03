"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);

    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setMsg("Account created. If email confirmation is enabled, check your inbox. Then sign in.");
      setMode("signin");
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative grid gap-2">
        <label className="text-xs text-white/70">Email</label>

        <input
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@email.com"
          required
        />

        {open && (
          <div
            className="absolute top-[64px] z-20 w-full overflow-hidden rounded-md border border-white/10 bg-black/80 backdrop-blur"
            onMouseDown={(e) => e.preventDefault()}
          >
              <div
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-white/10"
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => {
                    setEmail("test@test.com");
                    setOpen(false);
                  }}
                >
                  test@test.com
                </button>

                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs text-white/60 hover:text-white"
                  title="Remove"
                  onClick={() => {}}
                >
                  ✕
                </button>
              </div>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-xs text-white/70">Password</label>
        <input
          className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="••••••••"
          type="password"
          required
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {msg && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm text-emerald-100">
          {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
      >
        {busy ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
      </button>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setMsg(null);
          setMode(mode === "signin" ? "signup" : "signin");
        }}
        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        {mode === "signin" ? "Create an account" : "I already have an account"}
      </button>
    </form>
  );
}
