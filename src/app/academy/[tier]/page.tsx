import Link from "next/link";
import { notFound } from "next/navigation";

const TIERS: Record<
  string,
  {
    title: string;
    tagline: string;
    modules: { slug: string; title: string; outcome?: string }[];
    includes: string[];
    pricing: string;
  }
> = {
  "tier-1": {
    title: "Tier I — Foundational Literacy",
    tagline: "For beginners. Completion results in a Foundational Certificate.",
    modules: [
      { slug: "understanding-court-structure", title: "Understanding Court Structure" },
      { slug: "civil-procedure-basics", title: "Civil Procedure Basics" },
      { slug: "drafting-a-complaint", title: "Drafting a Complaint", outcome: "By the end, you will draft a procedurally compliant complaint." },
      { slug: "responding-to-a-complaint", title: "Responding to a Complaint", outcome: "By the end, you will draft a procedurally compliant response." },
      { slug: "deadlines-service", title: "Deadlines & Service" },
    ],
    includes: ["10–20 min structured lesson", "Downloadable checklist", "Structured template", "Practice scenario", "Self-assessment quiz"],
    pricing: "Free or low cost",
  },
  "tier-2": {
    title: "Tier II — Tactical Competence",
    tagline: "From literacy to performance.",
    modules: [
      { slug: "motion-practice-architecture", title: "Motion Practice Architecture", outcome: "By the end, you will draft a procedurally compliant motion." },
      { slug: "evidence-framing", title: "Evidence Framing" },
      { slug: "affidavits-declarations", title: "Affidavits & Declarations" },
      { slug: "discovery-strategy", title: "Discovery Strategy" },
      { slug: "preserving-error", title: "Preserving Error" },
    ],
    includes: ["Motion drafting labs", "Redline examples (bad vs good)", "Devil's Advocate exercises"],
    pricing: "Subscription",
  },
  "tier-3": {
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
};

export default async function AcademyTierPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;
  const data = TIERS[tier];
  if (!data) notFound();

  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {data.title}
        </h1>
        <p className="mt-2 text-white/70">{data.tagline}</p>
        <span className="mt-2 inline-block rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-0.5 text-xs text-amber-200">
          {data.pricing}
        </span>
      </header>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
        <p className="text-amber-100">
          <strong>Coming soon.</strong> Each module will include: Lesson • Framework Diagram • Checklist • Template • Simulation Exercise • Reflection Questions.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Modules
        </h2>
        <ul className="mt-4 space-y-3">
          {data.modules.map((m) => (
            <li
              key={m.slug}
              className="rounded-lg border border-white/10 bg-black/10 px-4 py-3"
            >
              <div className="font-medium text-white">{m.title}</div>
              {m.outcome && (
                <div className="mt-1 text-sm text-amber-200/90">{m.outcome}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Each module includes
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {data.includes.map((i) => (
            <li
              key={i}
              className="rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white/80"
            >
              {i}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/academy" className="inline-block text-sm text-amber-300/80 hover:text-amber-300">
        ← All tiers
      </Link>
    </article>
  );
}
