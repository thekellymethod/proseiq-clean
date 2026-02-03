"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default function SignupPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await (await supabase).auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        router.replace("/login");
        router.refresh();
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm opacity-70 mt-1">Supabase Auth (email + password).</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label title="Email" className="text-sm">Email</label>
            <input
              title="Email"
              placeholder="example@example.com"
              className="w-full border rounded-md px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <input
              title="Password"
              placeholder="********"
              className="w-full border rounded-md px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <div className="text-xs opacity-70">Minimum 8 characters.</div>
          </div>

          {error ? (
            <div className="text-sm text-red-600 border border-red-200 rounded-md p-3">
              {error}
            </div>
          ) : null}

          <button className="w-full rounded-md px-3 py-2 border" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>

          <button
            type="button"
            className="w-full rounded-md px-3 py-2 border"
            onClick={() => router.push("/login")}
            disabled={loading}
          >
            Back to sign in
          </button>
        </form>
      </div>
    </main>
  );
}
