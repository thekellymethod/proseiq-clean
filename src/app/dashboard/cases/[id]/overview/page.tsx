import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseStrategy from "@/components/case/CaseStrategy";

export default async function CaseOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="overview">
      <CaseStrategy caseId={id} />
    </CaseWorkspaceShell>
  );
}
