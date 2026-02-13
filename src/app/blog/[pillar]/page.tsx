import Link from "next/link";
import { notFound } from "next/navigation";

const PILLARS: Record<
  string,
  { title: string; tagline: string; topics: string[] }
> = {
  "procedural-foundations": {
    title: "Pillar I — Procedural Foundations",
    tagline: "Analytical, educational, slightly elevated.",
    topics: [
      "Why cases fail before they are heard",
      "The anatomy of a motion to dismiss",
      "The psychology of judicial decision-making",
      "Understanding jurisdiction before argument",
    ],
  },
  "strategic-positioning": {
    title: "Pillar II — Strategic Positioning",
    tagline: "Strategist, not tutor.",
    topics: [
      "Framing issues for maximum leverage",
      "Drafting with asymmetry in mind",
      "Offensive vs defensive litigation thinking",
      "How to evaluate settlement leverage",
    ],
  },
  "legal-literacy-access": {
    title: "Pillar III — Legal Literacy & Access",
    tagline: "Philosophical credibility.",
    topics: [
      "The justice gap",
      "Structural inequities in procedure",
      "Technology in legal empowerment",
      "AI's proper role in law",
    ],
  },
  "case-dissections": {
    title: "Pillar IV — Case Dissections",
    tagline: "Applied intelligence. Anonymous hypothetical case breakdowns.",
    topics: [
      "A failed complaint and why",
      "A well-structured response and why it works",
      "Tactical mistakes in evidence submission",
    ],
  },
};

export default async function BlogPillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const data = PILLARS[pillar];
  if (!data) notFound();

  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {data.title}
        </h1>
        <p className="mt-2 text-white/70">{data.tagline}</p>
      </header>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
        <p className="text-amber-100">
          <strong>Coming soon.</strong> Articles in this pillar will be published at 1–2 per week. Structured training available in{" "}
          <Link href="/academy" className="underline hover:text-amber-200">
            ProseIQ Academy
          </Link>
          .
        </p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
          Planned topics
        </h2>
        <ul className="mt-4 space-y-3">
          {data.topics.map((t) => (
            <li key={t} className="rounded-lg border border-white/10 bg-black/10 px-4 py-3 text-white/90">
              {t}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/blog" className="inline-block text-sm text-amber-300/80 hover:text-amber-300">
        ← All pillars
      </Link>
    </article>
  );
}
