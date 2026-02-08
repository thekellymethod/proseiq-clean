
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import { getCaseById } from "@/lib/cases";

export default async function CaseOverviewPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

}
