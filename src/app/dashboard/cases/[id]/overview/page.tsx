import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseOverviewPanel from "@/components/case/CaseOverviewPanel";

export default async function CaseOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="overview">
      <CaseOverviewPanel caseId={id} />
    </CaseWorkspaceShell>
  );
}
