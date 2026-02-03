import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";

export default async function CaseAnalysisPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template
      title="Case Analysis"
      subtitle="Claims, defenses, gaps, and drafting strategy."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Claims & Elements" />
        <Panel title="Defenses & Weaknesses" />
        <Panel title="Evidence Gaps" />
        <Panel title="Drafting Queue" />
      </div>
    </Template>
  );
}

function Panel({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="font-medium">{title}</div>
      <div className="mt-2 text-sm text-white/70">
        Wire data here next.
      </div>
    </div>
  );
}
