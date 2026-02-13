// src/app/dashboard/cases/[id]/timeline/page.tsx
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTimeline from "@/components/case/CaseTimeline";

export default async function CaseTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="events">
      <CaseTimeline caseId={id} />
    </CaseWorkspaceShell>
  );
}
