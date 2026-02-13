import { FadeIn } from "@/components/ui/SectionTransition";

const TRUST_ITEMS = [
  "Encrypted storage",
  "Isolated user workspaces",
  "Secure billing via Stripe",
  "SOC 2 compliance in progress",
];

export default function LandingTrust() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24" id="trust">
      <FadeIn>
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built for sensitive legal data.
        </h2>
      </FadeIn>

      <FadeIn>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-white/80"
            >
              {item}
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
