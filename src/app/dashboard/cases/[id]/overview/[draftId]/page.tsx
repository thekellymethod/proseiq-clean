
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DraftEditor from "@/components/case/DraftEditor";


export default async function DraftEditorPage({ params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="overview">
      <DraftEditor caseId={id} draftId={draftId} />
    </CaseWorkspaceShell>
  );
}