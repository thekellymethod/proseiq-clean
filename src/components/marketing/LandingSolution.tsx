import { FadeIn } from "@/components/ui/SectionTransition";

const STEPS = [
  {
    step: 1,
    title: "Enter your facts",
    body: "Guided intake",
  },
  {
    step: 2,
    title: "Build your timeline",
    body: "Events & deadlines",
  },
  {
    step: 3,
    title: "Organize exhibits",
    body: "Documents & labeling",
  },
  {
    step: 4,
    title: "Draft & export",
    body: "Court-ready documents",
  },
];

export default function LandingSolution() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24" id="solution">
      <FadeIn>
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          ProseIQ gives your case structure.
        </h2>
      </FadeIn>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <FadeIn key={s.step}>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-sm font-medium text-amber-300/90">Step {s.step}</div>
              <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-white/70">{s.body}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
