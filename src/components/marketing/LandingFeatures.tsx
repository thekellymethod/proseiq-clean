import { StaggerContainer, StaggerItem } from "@/components/ui/SectionTransition";

const PILLARS = [
  {
    title: "Case Control",
    items: ["Workspace", "Timeline", "Tasks"],
    pro: false,
  },
  {
    title: "Evidence & Drafting",
    items: ["Documents", "Exhibits", "Rich editor", "Templates", "PDF/DOCX export", "Bundles"],
    pro: false,
  },
  {
    title: "Intelligence",
    items: ["Legal research", "AI Assistant", "Coaching tools", "3D timeline view"],
    pro: true,
  },
];

export default function LandingFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24" id="features">
      <StaggerContainer delay={0} triggerOnView={true}>
        <div className="text-center">
          <StaggerItem>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Everything you need to organize and prepare your case
            </h2>
            <p className="mt-3 text-base text-white/70 max-w-2xl mx-auto">
              One structured workspace. Not scattered notes.
            </p>
          </StaggerItem>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <div
                className={`rounded-2xl border p-6 ${
                p.pro
                  ? "border-amber-300/20 bg-amber-300/5"
                  : "border-white/10 bg-white/[0.02]"
                }`}
              >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                {p.pro && (
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-xs font-medium text-amber-100">
                    Pro
                  </span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="text-sm text-white/75">
                    • {item}
                  </li>
                ))}
              </ul>
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </section>
  );
}
