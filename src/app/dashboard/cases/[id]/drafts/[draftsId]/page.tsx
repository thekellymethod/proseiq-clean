import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DraftEditor from "@/components/case/DraftEditor";

export default async function CaseDraftPage({ params }: { params: Promise<{ id: string; draftsId: string }> }) {
  const { id, draftsId } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="drafts">
      <DraftEditor caseId={id} draftId={draftsId} />
    </CaseWorkspaceShell>
  );
}
