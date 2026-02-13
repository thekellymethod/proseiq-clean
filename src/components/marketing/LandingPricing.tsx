import Link from "next/link";
import { FadeIn } from "@/components/ui/SectionTransition";

export default function LandingPricing() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24" id="pricing">
      <FadeIn>
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Simple, serious tools for serious cases.
          </h2>
          <p className="mt-3 text-base text-white/70 max-w-xl mx-auto">
            Choose the plan that matches your level of legal self-representation. No long-term contracts.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 md:flex-row md:justify-center md:items-stretch">
          {/* Basic */}
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">Basic — $29 / month</h3>
            <p className="mt-2 text-sm text-white/70">
              Case workspace, timeline, documents, exhibits, drafting, export, bundles.
            </p>
            <Link
              href="/signup"
              className="mt-6 block w-full rounded-md border border-emerald-300/30 bg-emerald-300/12 py-2.5 text-center text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-300/20"
            >
              Start Basic Plan
            </Link>
          </div>

          {/* Pro - elevated */}
          <div className="relative w-full max-w-sm rounded-2xl border border-amber-300/25 bg-amber-300/10 p-6 shadow-lg shadow-amber-900/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/30 bg-amber-300/20 px-3 py-0.5 text-xs font-medium text-amber-100">
              Recommended
            </div>
            <h3 className="text-xl font-semibold text-white">Pro — $59 / month</h3>
            <p className="mt-2 text-sm text-white/70">
              Everything in Basic, plus legal research, AI Assistant, coaching tools, 3D timeline.
            </p>
            <Link
              href="/signup"
              className="mt-6 block w-full rounded-md border border-amber-300/30 bg-amber-300/12 py-2.5 text-center text-sm font-medium text-amber-100 transition-colors hover:bg-amber-300/20"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/50">
          No legal advice. Tools only.
        </p>
      </FadeIn>
    </section>
  );
}
