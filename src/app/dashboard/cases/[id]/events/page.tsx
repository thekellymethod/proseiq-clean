import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseEventsTimelineView from "@/components/case/CaseEventsTimelineView";
import { getPlanForUser } from "@/lib/billing/plan";

export default async function CaseEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanForUser();
  return (
    <CaseWorkspaceShell caseId={id} active="events">
      <CaseEventsTimelineView caseId={id} plan={plan} />
    </CaseWorkspaceShell>
  );
}