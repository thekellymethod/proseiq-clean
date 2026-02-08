import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DraftEditor from "@/components/case/DraftEditor";

export default async function CaseDraftPage({ params }: { params: { id: string; draftId: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="drafts">
      <DraftEditor caseId={params.id} draftId={params.draftId} />
    </CaseWorkspaceShell>
  );
}
