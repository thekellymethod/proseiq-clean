import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseAssistantPanel from "@/components/case/CaseAssistantPanel";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="assistant">
      <CaseAssistantPanel caseId={id} />
    </CaseWorkspaceShell>
  );
}

