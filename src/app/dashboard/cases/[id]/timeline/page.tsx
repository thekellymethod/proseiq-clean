import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTimeline from "@/components/case/CaseTimeline";
import { getCaseById } from "@/lib/cases";

export default async function CaseTimelinePage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Timeline">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="timeline">
        <CaseTimeline caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
