import { default as CaseDocuments } from "@/components/case/CaseDocuments";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";

export default async function CaseDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="documents">
      <CaseDocuments params={{ caseId: id }} />
    </CaseWorkspaceShell>
  );
}
