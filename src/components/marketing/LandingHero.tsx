import Link from "next/link";
import Image from "next/image";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/SectionTransition";

export default function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              Case management for self-represented litigants
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Organize your case. Meet your deadlines. Be prepared for court.
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mt-4 text-base text-white/70">
              ProseIQ helps pro se litigants manage their cases from start to finish. Organize your facts, track deadlines, label exhibits, draft motions, and export court-ready documents—all in one secure workspace.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-300/20"
              >
                Start free trial
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-6 grid gap-3 sm:grid-cols-3" delay={0.32} triggerOnView={false}>
            <StaggerItem><Metric label="Timeline" value="Deadlines & events" /></StaggerItem>
            <StaggerItem><Metric label="Exhibits" value="Labels & bundles" /></StaggerItem>
            <StaggerItem><Metric label="Drafting" value="Motions & filings" /></StaggerItem>
          </StaggerContainer>
        </div>

        <FadeIn delay={0.2}>
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex items-center gap-3">
              <HeroLogo src="/logo.PNG" alt="ProseIQ logo" />
              <HeroLogo src="/proseiq.PNG" alt="ProseIQ mark" />
            </div>
            <div>
              <div className="text-sm text-white/60">Your case, organized</div>
              <div className="mt-2 text-xs text-white/50">
                Intake → Timeline → Exhibits → Drafts → Export
              </div>
            </div>
          </div>

          <div className="relative mt-6 space-y-3">
            <PreviewCard title="Guided case intake">
              Enter your case details once. ProseIQ helps you build a timeline, organize exhibits, and prepare drafting sections.
            </PreviewCard>
            <PreviewCard title="Deadlines & events">
              Track hearings, filing deadlines, and reminders in one place—no more missed deadlines.
            </PreviewCard>
            <PreviewCard title="Exhibits & bundles">
              Label exhibits, number pages, and export court-ready documents for filing or sharing.
            </PreviewCard>
          </div>

          <div className="relative mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            Bank-level security. Your case data is encrypted and isolated from other users. SOC 2 compliance in progress.
          </div>
        </div>
        </FadeIn>
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

function HeroLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-amber-300/25 via-white/5 to-sky-400/25 blur-lg opacity-80" />
      <div className="relative rounded-2xl border border-white/10 bg-black/20 p-2">
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          priority
          className="h-24 w-24 rounded-xl object-contain"
        />
      </div>
    </div>
  );
}
