import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTimeline from "@/components/case/CaseTimeline";

export default async function CaseEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="timeline">
      <CaseTimeline caseId={id} />
    </CaseWorkspaceShell>
  );
}