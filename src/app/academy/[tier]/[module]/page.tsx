import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAcademyTierBySlug,
  getAcademyModuleBySlug,
  getAcademyModuleContent,
} from "@/lib/content/academy";
import { MediaBlock } from "@/components/content/MediaBlock";

export default async function AcademyModulePage({
  params,
}: {
  params: Promise<{ tier: string; module: string }>;
}) {
  const { tier, module: moduleSlug } = await params;
  const tierRow = await getAcademyTierBySlug(tier);
  if (!tierRow) notFound();

  const moduleRow = await getAcademyModuleBySlug(tierRow.id, moduleSlug);
  if (!moduleRow) notFound();

  const contentBlocks = await getAcademyModuleContent(moduleRow.id);

  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {moduleRow.title}
        </h1>
        {moduleRow.outcome && (
          <p className="mt-2 text-amber-200/90">{moduleRow.outcome}</p>
        )}
      </header>

      {contentBlocks.length === 0 ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
          <p className="text-amber-100">
            <strong>Coming soon.</strong> Lesson content, checklists, and materials will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {contentBlocks.map((block) => (
            <section key={block.id} className="space-y-4">
              {block.title && (
                <h2 className="text-lg font-medium text-white">{block.title}</h2>
              )}
              {block.content && (
                <div
                  className="prose prose-invert prose-headings:text-white prose-p:text-white/90 prose-a:text-amber-300 prose-strong:text-white max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
              {Array.isArray(block.media) && block.media.length > 0 && (
                <div className="space-y-4">
                  {block.media.map((m: { url?: string; type?: string; alt?: string; title?: string }, i: number) => (
                    <MediaBlock key={i} media={m} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <footer className="border-t border-white/10 pt-6">
        <Link href={`/academy/${tier}`} className="text-amber-300/80 hover:text-amber-300">
          ← Back to {tierRow.title}
        </Link>
      </footer>
    </article>
  );
}
