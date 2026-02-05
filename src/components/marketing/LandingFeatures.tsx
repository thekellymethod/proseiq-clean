const FEATURES: Array<{ title: string; body: string }> = [
    {
      title: "Case intake that generates structure",
      body: "Enter facts once. ProseIQ seeds milestones, parties, and an exhibit ladder so you start organized—not improvising.",
    },
    {
      title: "Timeline + proof notes",
      body: "Chronology and procedure together. Every event can carry notes about what happened and what you can prove.",
    },
    {
      title: "Exhibit labeling and packet generation",
      body: "Maintain a clean exhibit ladder and export bundles with predictable labels and a Bates-stamp pipeline.",
    },
    {
      title: "Drafting-ready workspace",
      body: "Structured sections for motions, responses, discovery, and arbitration submissions (future: AI assist).",
    },
    {
      title: "Research hub ready to plug in",
      body: "Designed to connect statutes/cases/citations to a case without cross-user leakage.",
    },
    {
      title: "RLS + audit-ready architecture",
      body: "Supabase row-level security isolates each user’s cases and artifacts. Audit logging fits cleanly.",
    },
  ];
  
  export default function LandingFeatures() {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">What ProseIQ helps you do</h2>
          <p className="mt-2 text-sm text-white/70">
            Organize, manage, and litigate effectively with repeatable workflows—not scattered notes.
          </p>
  
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">{f.title}</div>
                <div className="mt-1 text-sm text-white/70">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }