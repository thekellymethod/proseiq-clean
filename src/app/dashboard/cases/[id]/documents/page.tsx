
import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseDocuments from "@/components/case/CaseDocuments";

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
        <CaseDocuments caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
