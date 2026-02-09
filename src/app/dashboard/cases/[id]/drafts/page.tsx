import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DraftsPanel from "@/components/case/DraftsPanel";

export default async function CaseDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="drafts">
      <DraftsPanel caseId={id} />
    </CaseWorkspaceShell>
  );
}
