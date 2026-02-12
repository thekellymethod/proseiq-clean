import { StaggerContainer, StaggerItem } from "@/components/ui/SectionTransition";

const FEATURES: Array<{ title: string; body: string }> = [
  {
    title: "Case intake that builds structure",
    body: "Enter your facts once. ProseIQ helps you generate a timeline, list parties, and organize exhibits so you start organized—not scrambling.",
  },
  {
    title: "Timeline with proof notes",
    body: "Keep your chronology and evidence together. Every event can include notes about what happened and what you can prove.",
  },
  {
    title: "Exhibit labeling and document bundles",
    body: "Maintain a clear exhibit list and export court-ready documents with consistent labels and page numbering.",
  },
  {
    title: "Drafting workspace",
    body: "Structured sections for motions, responses, discovery, and submissions. Organize your filings before you file.",
  },
  {
    title: "Research & citations",
    body: "Connect statutes, cases, and citations to your case. Keep your research organized and linked to your arguments.",
  },
  {
    title: "Secure & private",
    body: "Your case data is encrypted and isolated. Only you can access your cases. We never share your information with third parties.",
  },
];

export default function LandingFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14">
      <StaggerContainer className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <StaggerItem>
          <h2 className="text-xl font-semibold text-white">What ProseIQ helps you do</h2>
          <p className="mt-2 text-sm text-white/70">
            Organize, manage, and prepare your case with clear workflows—not scattered notes.
          </p>
        </StaggerItem>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-white/20">
                <div className="text-sm font-medium text-white">{f.title}</div>
                <div className="mt-1 text-sm text-white/70">{f.body}</div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </section>
  );
}
