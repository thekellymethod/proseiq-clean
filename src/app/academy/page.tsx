import Link from "next/link";

const TIERS = [
  {
    slug: "tier-1",
    title: "Tier I — Foundational Literacy",
    tagline: "For beginners. Completion results in a Foundational Certificate.",
    modules: [
      { slug: "understanding-court-structure", title: "Understanding Court Structure" },
      { slug: "civil-procedure-basics", title: "Civil Procedure Basics" },
      { slug: "drafting-a-complaint", title: "Drafting a Complaint" },
      { slug: "responding-to-a-complaint", title: "Responding to a Complaint" },
      { slug: "deadlines-service", title: "Deadlines & Service" },
    ],
    includes: ["10–20 min structured lesson", "Downloadable checklist", "Structured template", "Practice scenario", "Self-assessment quiz"],
    pricing: "Free or low cost",
  },
  {
    slug: "tier-2",
    title: "Tier II — Tactical Competence",
    tagline: "From literacy to performance.",
    modules: [
      { slug: "motion-practice-architecture", title: "Motion Practice Architecture" },
      { slug: "evidence-framing", title: "Evidence Framing" },
      { slug: "affidavits-declarations", title: "Affidavits & Declarations" },
      { slug: "discovery-strategy", title: "Discovery Strategy" },
      { slug: "preserving-error", title: "Preserving Error" },
    ],
    includes: ["Motion drafting labs", "Redline examples (bad vs good)", "Devil's Advocate exercises"],
    pricing: "Subscription",
  },
  {
    slug: "tier-3",
    title: "Tier III — Strategic Litigation",
    tagline: "Advanced. Differentiate from random legal advice.",
    modules: [
      { slug: "case-mapping-timeline", title: "Case Mapping & Timeline Construction" },
      { slug: "risk-analysis", title: "Risk Analysis" },
      { slug: "settlement-leverage", title: "Settlement Leverage" },
      { slug: "trial-preparation", title: "Trial Preparation Fundamentals" },
      { slug: "appellate-awareness", title: "Appellate Awareness" },
    ],
    includes: ["Strategic frameworks", "Outcome-based modules"],
    pricing: "Premium",
  },
];

export default function AcademyPage() {
  return (
    <article className="space-y-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          ProseIQ Academy
        </h1>
        <p className="mt-3 text-lg text-white/80">
          Blueprint Series. Transform confused litigants into structured operators. Law is a discipline of repetition, not inspiration.
        </p>
        <p className="mt-2 text-sm text-amber-200/90 italic">
          Structure determines authority. — Dr. Kelly
        </p>
      </header>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
        <p className="text-amber-100">
          <strong>Coming soon.</strong> Each module is outcome-based. Not &ldquo;Understanding Motions&rdquo; but &ldquo;By the end of this module, you will draft a procedurally compliant motion.&rdquo; Clarity sells competence.
        </p>
      </div>

      <div className="space-y-8">
        {TIERS.map((t) => (
          <section
            key={t.slug}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{t.title}</h2>
                <p className="mt-1 text-sm text-white/70">{t.tagline}</p>
                <span className="mt-2 inline-block rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-0.5 text-xs text-amber-200">
                  {t.pricing}
                </span>
              </div>
              <Link
                href={`/academy/${t.slug}`}
                className="shrink-0 rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
              >
                Explore tier →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Modules
                </h3>
                <ul className="mt-2 space-y-1">
                  {t.modules.map((m) => (
                    <li key={m.slug} className="text-sm text-white/80">
                      • {m.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Each module includes
                </h3>
                <ul className="mt-2 space-y-1">
                  {t.includes.map((i) => (
                    <li key={i} className="text-sm text-white/80">
                      • {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/10 p-6">
        <h3 className="font-medium text-white">Operational structure</h3>
        <p className="mt-2 text-sm text-white/70">
          Lesson • Framework Diagram • Checklist • Template • Simulation Exercise • Reflection Questions. This builds muscle memory.
        </p>
      </div>

      <div className="border-t border-white/10 pt-8">
        <p className="text-sm text-white/60">
          Blog → &ldquo;Here is how litigation works.&rdquo; Academy → &ldquo;Here is how to do it.&rdquo; Platform → &ldquo;Here is the structured tool to apply it.&rdquo;
        </p>
      </div>
    </article>
  );
}
