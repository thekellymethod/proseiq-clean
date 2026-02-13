import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/SectionTransition";

export default function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <FadeIn delay={0}>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Organize your case.
              <br />
              Meet your deadlines.
              <br />
              Be prepared for court.
            </h1>
          </FadeIn>

          <FadeIn delay={0.08}>
            <p className="mt-6 text-base leading-relaxed text-white/75 max-w-lg">
              ProseIQ gives self-represented litigants a structured system to manage filings, evidence, timelines, and drafting — in one secure workspace.
            </p>
          </FadeIn>

          <FadeIn delay={0.16}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-md border border-amber-300/30 bg-amber-300/12 px-5 py-2.5 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-300/20"
              >
                Start free trial
              </Link>
              <Link
                href="#pricing"
                className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                View pricing
              </Link>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.12}>
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-300/10 blur-2xl" />
            <div className="relative flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-4">
                <Image
                  src="/logo.PNG"
                  alt="ProseIQ"
                  width={80}
                  height={80}
                  priority
                  className="h-20 w-20 rounded-xl object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white/90">Case Workspace</div>
                <div className="mt-1 text-xs text-white/50">
                  Intake → Timeline → Exhibits → Drafts → Export
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
