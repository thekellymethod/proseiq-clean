import Link from "next/link";
import { FadeIn } from "@/components/ui/SectionTransition";

export default function LandingFinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
      <FadeIn>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Take control of your case.
          </h2>
          <p className="mt-3 text-base text-white/70">
            Structure first. Strategy when you need it.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-md border border-amber-300/30 bg-amber-300/12 px-6 py-3 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-300/20"
          >
            Start free trial
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
