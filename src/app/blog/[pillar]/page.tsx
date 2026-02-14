import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPillarBySlug, getBlogArticles } from "@/lib/content/blog";

export default async function BlogPillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const pillarRow = await getBlogPillarBySlug(pillar);
  if (!pillarRow) notFound();

  const articles = await getBlogArticles(pillarRow.id);
  const data = {
    title: pillarRow.title,
    tagline: pillarRow.tagline ?? "",
    topics: Array.isArray(pillarRow.topics) ? pillarRow.topics : [],
    articles,
  };

  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {data.title}
        </h1>
        <p className="mt-2 text-white/70">{data.tagline}</p>
      </header>

      {data.articles.length > 0 ? (
        <div>
          <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
            Articles
          </h2>
          <ul className="mt-4 space-y-3">
            {data.articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/blog/${pillar}/${a.slug}`}
                  className="block rounded-lg border border-white/10 bg-black/10 px-4 py-3 text-white/90 transition-colors hover:bg-white/5 hover:border-amber-300/20"
                >
                  <span className="font-medium">{a.title}</span>
                  {a.excerpt && (
                    <p className="mt-1 text-sm text-white/70">{a.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
          <p className="text-amber-100">
            <strong>Coming soon.</strong> Articles in this pillar will be published at 1–2 per week. Structured training available in{" "}
            <Link href="/academy" className="underline hover:text-amber-200">
              ProseIQ Academy
            </Link>
            .
          </p>
        </div>
      )}

      {data.topics.length > 0 && (
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
      )}

      <Link href="/blog" className="inline-block text-sm text-amber-300/80 hover:text-amber-300">
        ← All pillars
      </Link>
    </article>
  );
}
