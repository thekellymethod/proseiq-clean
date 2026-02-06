import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseDocuments from "@/components/case/CaseDocuments";
import { getCaseById } from "@/lib/cases";

export default async function CaseDocumentsPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Documents">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="documents">
        <CaseDocuments caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
