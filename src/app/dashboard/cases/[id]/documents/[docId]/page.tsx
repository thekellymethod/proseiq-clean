import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DocumentViewer from "@/components/case/DocumentViewer";

export default async function CaseDocumentViewPage({ params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="documents">
      <DocumentViewer caseId={id} docId={docId} />
    </CaseWorkspaceShell>
  );
}

