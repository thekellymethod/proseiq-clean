
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseMotions from "@/components/case/CaseMotions";


export default async function CaseMotionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="analysis">
      <CaseMotions caseId={id} />
    </CaseWorkspaceShell>
  );
}

