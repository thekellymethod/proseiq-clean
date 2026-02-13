import Link from "next/link";
import { FadeIn } from "@/components/ui/SectionTransition";

export default function LandingThreeLayers() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24" id="learn">
      <FadeIn>
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Three layers. One system.
          </h2>
          <p className="mt-3 text-base text-white/70 max-w-2xl mx-auto">
            Thought leadership. Structured training. Execution. They interlock without collapsing into each other.
          </p>
          <p className="mt-2 text-sm text-amber-200/90 italic">
            Structure determines authority. — Dr. Kelly
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Link
            href="/blog"
            className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 hover:border-amber-300/20"
          >
            <h3 className="text-lg font-semibold text-white group-hover:text-amber-200">
              The Litigation Architect
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Strategic insight. Establish intellectual authority, shape narrative, attract organic traffic.
            </p>
            <p className="mt-3 text-xs text-white/50">
              Blog → &ldquo;Here is how litigation works.&rdquo;
            </p>
            <span className="mt-4 inline-block text-sm text-amber-300/80 group-hover:text-amber-300">
              Explore →
            </span>
          </Link>

          <Link
            href="/academy"
            className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 hover:border-amber-300/20"
          >
            <h3 className="text-lg font-semibold text-white group-hover:text-amber-200">
              ProseIQ Academy
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Blueprint Series. Transform confused litigants into structured operators. Outcome-based modules.
            </p>
            <p className="mt-3 text-xs text-white/50">
              Academy → &ldquo;Here is how to do it.&rdquo;
            </p>
            <span className="mt-4 inline-block text-sm text-amber-300/80 group-hover:text-amber-300">
              Explore →
            </span>
          </Link>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white">
              ProseIQ Platform
            </h3>
            <p className="mt-2 text-sm text-white/70">
              The structured tool to apply it. Case workspace, timeline, exhibits, drafting, export.
            </p>
            <p className="mt-3 text-xs text-white/50">
              Platform → &ldquo;Here is the execution engine.&rdquo;
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-block text-sm text-amber-300/80 hover:text-amber-300"
            >
              Start free trial →
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
