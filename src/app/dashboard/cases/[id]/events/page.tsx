import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseEventsTimelineView from "@/components/case/CaseEventsTimelineView";

export default async function CaseEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="events">
      <CaseEventsTimelineView caseId={id} />
    </CaseWorkspaceShell>
  );
}