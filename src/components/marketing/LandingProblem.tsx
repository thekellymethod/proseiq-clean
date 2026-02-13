import { FadeIn } from "@/components/ui/SectionTransition";

const PROBLEMS = [
  {
    title: "Missed deadlines",
    body: "One late filing can cost you the case. Scattered calendars and sticky notes aren't enough.",
  },
  {
    title: "Disorganized evidence",
    body: "Finding the right exhibit when you need it — or explaining what it proves — shouldn't be a scramble.",
  },
  {
    title: "Scattered notes and drafts",
    body: "Notes in Google Docs, Word files, emails. Nothing connects. Nothing is court-ready.",
  },
];

export default function LandingProblem() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24" id="problem">
      <FadeIn>
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Representing yourself is overwhelming.
        </h2>
        <p className="mt-4 text-center text-base text-white/70 max-w-2xl mx-auto">
          Without structure, small procedural mistakes can cost you your case.
        </p>
      </FadeIn>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PROBLEMS.map((p) => (
          <FadeIn key={p.title}>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
              <h3 className="text-lg font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-white/70">{p.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
