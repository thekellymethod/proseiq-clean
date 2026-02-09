import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseAnalysis from "@/components/case/CaseAnalysis";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="analysis">
      <CaseAnalysis caseId={id} />
    </CaseWorkspaceShell>
  );
}
