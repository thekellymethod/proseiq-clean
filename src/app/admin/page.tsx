"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AdminAcademy from "@/components/admin/AdminAcademy";
import AdminBlog from "@/components/admin/AdminBlog";

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"academy" | "blog">("academy");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      window.location.href = `/api/admin/auth?token=${encodeURIComponent(token)}`;
      return;
    }

    fetch("/api/admin/academy/tiers", { credentials: "include" })
      .then((r) => {
        setAuthorized(r.ok);
      })
      .catch(() => setAuthorized(false));
  }, [searchParams]);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Checking access…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-xl font-semibold text-slate-200">Admin Access</h1>
        <p className="max-w-md text-center text-slate-400">
          Access the admin panel by visiting{" "}
          <code className="rounded bg-slate-800 px-2 py-1 text-amber-300">
            /admin?token=YOUR_ADMIN_SECRET
          </code>
          . Set <code className="rounded bg-slate-800 px-2 py-1">ADMIN_SECRET</code> in your environment.
        </p>
        <Link
          href="/"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          ← Back to site
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8 flex items-center justify-between border-b border-slate-700 pb-6">
        <h1 className="text-2xl font-semibold text-white">ProseIQ Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("academy")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === "academy"
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Academy
          </button>
          <button
            onClick={() => setTab("blog")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === "blog"
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Blog
          </button>
          <Link
            href="/"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            View site
          </Link>
        </div>
      </header>

      {tab === "academy" && <AdminAcademy />}
      {tab === "blog" && <AdminBlog />}
    </div>
  );
}
