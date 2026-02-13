
import { getCaseById } from "@/lib/cases";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTasks from "@/components/case/CaseTasks";

export default async function CaseTasksPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <CaseTasks caseId={params.id} />;
}