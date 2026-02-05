import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTimeline from "@/components/case/CaseTimeline";

export default async function CaseTimelinePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const c = await getCaseById(params.id);

  return (
    <Template title="Case" subtitle="Timeline">
      <CaseWorkspaceShell
        caseId={params.id}
        title={c.title}
        subtitle={`${c.case_type ?? "general"} • ${c.status ?? "intake"} • ${c.priority ?? "normal"}`}
        active="timeline"
      >
        <CaseTimeline caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}