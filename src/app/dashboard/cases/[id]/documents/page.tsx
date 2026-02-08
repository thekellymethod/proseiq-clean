
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import  CaseDocuments  from "@/components/case/CaseDocuments";
import { getCaseById } from "@/lib/cases";


export default async function CaseDocumentsPage({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <CaseDocuments caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
