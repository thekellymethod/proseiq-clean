import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTimeline from "@/components/case/CaseTimeline";

export default async function CaseEventsPage({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="timeline">
      <CaseTimeline caseId={params.id} />
    </CaseWorkspaceShell>
  );
}