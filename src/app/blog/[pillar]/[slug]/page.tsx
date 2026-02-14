import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPillarBySlug, getBlogArticleBySlug } from "@/lib/content/blog";
import { MediaBlock } from "@/components/content/MediaBlock";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar, slug } = await params;
  const pillarRow = await getBlogPillarBySlug(pillar);
  if (!pillarRow) notFound();

  const article = await getBlogArticleBySlug(pillarRow.id, slug);
  if (!article || !article.published_at) notFound();

  return (
    <article className="prose prose-invert max-w-none">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-3 text-lg text-white/80">{article.excerpt}</p>
        )}
      </header>

      <div
        className="prose prose-invert prose-headings:text-white prose-p:text-white/90 prose-a:text-amber-300 prose-strong:text-white max-w-none"
        dangerouslySetInnerHTML={{
          __html: article.content || (typeof article.content_rich === "string" ? article.content_rich : "") || "",
        }}
      />

      {Array.isArray(article.media) && article.media.length > 0 && (
        <div className="mt-8 space-y-4">
          {article.media.map((m: { url?: string; type?: string; alt?: string; title?: string }, i: number) => (
            <MediaBlock key={i} media={m} />
          ))}
        </div>
      )}

      <footer className="mt-12 border-t border-white/10 pt-6">
        <Link href={`/blog/${pillar}`} className="text-amber-300/80 hover:text-amber-300">
          ← Back to {pillarRow.title}
        </Link>
      </footer>
    </article>
  );
}
