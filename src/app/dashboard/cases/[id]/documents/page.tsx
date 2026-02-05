import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";

export default async function CaseDocumentsPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);
  return (
    <Template title="Case" subtitle="Documents">
      <CaseWorkspaceShell
        caseId={params.id}
        title={c.title}
        subtitle={`${c.case_type ?? "general"} • ${c.status ?? "intake"} • ${c.priority ?? "normal"}`}
        active="documents"
      >
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-white font-semibold">Documents</h3>
          <p className="mt-2 text-sm text-white/70">Add and manage documents for the case.</p>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/70">
            Placeholder: this section will become fully interactive in the next patch.
          </div>
        </section>
      </CaseWorkspaceShell>
    </Template>
  );
}