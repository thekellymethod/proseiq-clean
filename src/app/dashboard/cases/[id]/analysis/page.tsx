import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseAnalysis from "@/components/case/CaseAnalysis";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <CaseAnalysis caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
