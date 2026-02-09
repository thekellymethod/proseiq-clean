import { default as CaseDocuments } from "@/components/case/CaseDocuments";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";

export default function CaseDocumentsPage({ params }: { params: { caseId: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.caseId} active="documents">
      <CaseDocuments params={params} />
    </CaseWorkspaceShell>
  );
}
