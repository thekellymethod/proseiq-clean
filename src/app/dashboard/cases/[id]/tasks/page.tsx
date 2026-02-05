import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTasks from "@/components/case/CaseTasks";

export default async function CaseTasksPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title="Case" subtitle="Tasks">
      <CaseWorkspaceShell
        caseId={params.id}
        title={c.title}
        subtitle={`${c.case_type ?? "general"} • ${c.status ?? "intake"} • ${c.priority ?? "normal"}`}
        active="tasks"
      >
        <CaseTasks caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}