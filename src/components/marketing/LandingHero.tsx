import Link from "next/link";
import Image from "next/image";

export default function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Pro se workflows • Court + arbitration • RLS-isolated accounts
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Turn intake into a case command center.
          </h1>

          <p className="mt-4 text-base text-white/70">
            ProseIQ converts your facts into structure: milestones, deadlines, exhibits, drafts, and export pipelines—
            designed for people representing themselves who still want professional-grade organization.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-300/20"
            >
              Enter the app
            </Link>
            <Link
              href="/dashboard/cases/new"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Create a case
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Timeline" value="milestones + proof notes" />
            <Metric label="Exhibits" value="labels + bundles" />
            <Metric label="Drafting" value="structured sections" />
          </div>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 overflow-hidden">
          {/* glow blobs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-amber-300/25 via-white/5 to-sky-400/25 blur-lg opacity-80" />
              <div className="relative rounded-2xl border border-white/10 bg-black/20 p-2">
                <Image
                  src="/proseiq-logo-512-a.png"
                  alt="ProseIQ"
                  width={96}
                  height={96}
                  priority
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <div className="text-white text-lg font-semibold">ProseIQ</div>
              <div className="text-sm text-white/60">A case workspace you can actually use.</div>
              <div className="mt-2 text-xs text-white/50">
                Intake → Timeline → Exhibits → Drafts → Export
              </div>
            </div>
          </div>

          <div className="relative mt-6 space-y-3">
            <PreviewCard title="Intake → Workspace">
              Enter facts once. Generate a timeline, exhibit ladder, and drafting sections.
            </PreviewCard>
            <PreviewCard title="Deadlines + Events">
              Track hearings, filings, reminders, and deadlines without a spreadsheet explosion.
            </PreviewCard>
            <PreviewCard title="Exhibits + Bundles">
              Label exhibits, apply Bates stamps (pipeline), and export court-ready packets.
            </PreviewCard>
          </div>

          <div className="relative mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            Designed to monetize: neutral placeholders, templates, and per-user isolation via RLS.
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="mt-1 text-sm text-white/70">{children}</div>
    </div>
  );
}