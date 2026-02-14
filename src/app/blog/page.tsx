import Link from "next/link";
import { getBlogPillars } from "@/lib/content/blog";

const PILLARS_FALLBACK = [
  { slug: "procedural-foundations", title: "Pillar I — Procedural Foundations", tagline: "Analytical, educational, slightly elevated.", topics: ["Why cases fail before they are heard", "The anatomy of a motion to dismiss", "The psychology of judicial decision-making", "Understanding jurisdiction before argument"] },
  { slug: "strategic-positioning", title: "Pillar II — Strategic Positioning", tagline: "Strategist, not tutor.", topics: ["Framing issues for maximum leverage", "Drafting with asymmetry in mind", "Offensive vs defensive litigation thinking", "How to evaluate settlement leverage"] },
  { slug: "legal-literacy-access", title: "Pillar III — Legal Literacy & Access", tagline: "Philosophical credibility.", topics: ["The justice gap", "Structural inequities in procedure", "Technology in legal empowerment", "AI's proper role in law"] },
  { slug: "case-dissections", title: "Pillar IV — Case Dissections", tagline: "Applied intelligence.", topics: ["A failed complaint and why", "A well-structured response and why it works", "Tactical mistakes in evidence submission"] },
];

export default async function BlogPage() {
  const dbPillars = await getBlogPillars();
  const pillars = dbPillars && dbPillars.length > 0
    ? dbPillars.map((p) => ({
        slug: p.slug,
        title: p.title,
        tagline: p.tagline ?? "",
        topics: Array.isArray(p.topics) ? p.topics : [],
      }))
    : PILLARS_FALLBACK;
  return (
    <article className="space-y-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          The Litigation Architect
        </h1>
        <p className="mt-3 text-lg text-white/80">
          Strategic insight. Not a how-to manual. Establish intellectual authority, shape narrative, and build trust.
        </p>
        <p className="mt-2 text-sm text-amber-200/90 italic">
          Structure determines authority. — Dr. Kelly
        </p>
      </header>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
        <p className="text-amber-100">
          <strong>Coming soon.</strong> 1–2 high-quality articles per week. Evergreen, SEO-informed. Each article will end with a soft bridge: &ldquo;Structured training available in ProseIQ Academy.&rdquo;
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {pillars.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 hover:border-amber-300/20"
          >
            <h2 className="text-lg font-semibold text-white">{p.title}</h2>
            <p className="mt-1 text-sm text-white/60">{p.tagline}</p>
            <ul className="mt-4 space-y-2">
              {p.topics.slice(0, 3).map((t) => (
                <li key={t} className="text-sm text-white/70">
                  • {t}
                </li>
              ))}
              {p.topics.length > 3 && (
                <li className="text-sm text-white/50">+{p.topics.length - 3} more</li>
              )}
            </ul>
            <span className="mt-4 inline-block text-xs text-amber-300/80">Explore pillar →</span>
          </Link>
        ))}
      </div>

      <div className="border-t border-white/10 pt-8">
        <p className="text-sm text-white/60">
          Blog → &ldquo;Here is how litigation works.&rdquo; Academy → &ldquo;Here is how to do it.&rdquo; Platform → &ldquo;Here is the structured tool to apply it.&rdquo;
        </p>
      </div>
    </article>
  );
}
