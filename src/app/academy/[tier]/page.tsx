import Link from "next/link";
import { notFound } from "next/navigation";
import { getAcademyTierBySlug, getAcademyModules } from "@/lib/content/academy";

export default async function AcademyTierPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;
  const tierRow = await getAcademyTierBySlug(tier);
  const modules = tierRow ? await getAcademyModules(tierRow.id) : [];

  const data = tierRow
    ? {
        title: tierRow.title,
        tagline: tierRow.tagline ?? "",
        pricing: tierRow.pricing ?? "",
        includes: Array.isArray(tierRow.includes) ? tierRow.includes : [],
        modules: modules.map((m) => ({
          slug: m.slug,
          title: m.title,
          outcome: m.outcome ?? undefined,
        })),
      }
    : null;

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
            <li key={m.slug}>
              <Link
                href={`/academy/${tier}/${m.slug}`}
                className="block rounded-lg border border-white/10 bg-black/10 px-4 py-3 transition-colors hover:bg-white/5 hover:border-amber-300/20"
              >
                <div className="font-medium text-white">{m.title}</div>
                {m.outcome && (
                  <div className="mt-1 text-sm text-amber-200/90">{m.outcome}</div>
                )}
                <span className="mt-2 inline-block text-xs text-amber-300/80">View module →</span>
              </Link>
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
