//template.jsx
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function Template({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#071225] via-[#0B1B3A] to-[#B8891A]" />
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="font-semibold tracking-wide">
            Prose<span className="text-amber-300">IQ</span>
          </Link>
          <div className="flex gap-2">
            {actions}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          {children}
        </section>
      </main>
    </div>
  );
}
