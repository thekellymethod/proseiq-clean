// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();

      // Password signup (MVP)
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Depending on Supabase email-confirm settings, user may need confirmation.
      // For MVP, just send them to login.
      router.replace("/login");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#071225] via-[#0B1B3A] to-[#B8891A]" />
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h1 className="text-xl font-semibold tracking-wide">
            Prose<span className="text-amber-300">IQ</span>
          </h1>

          <p className="mt-1 text-sm text-white/70">Create your account.</p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div className="grid gap-2">
              <label className="text-xs text-white/70">Email</label>
              <input
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@email.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/70">Password</label>
              <input
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20 disabled:opacity-60"
            >
              {busy ? "Working..." : "Create account"}
            </button>

            <div className="text-center text-xs text-white/60">
              Already have an account?{" "}
              <a className="text-amber-200 hover:text-amber-100" href="/login">
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
