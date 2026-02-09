
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import { CaseParties } from "@/components/case/CaseParties";

export default async function CasePartiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="analysis">
      <CaseParties caseId={id} />
    </CaseWorkspaceShell>
  );
}
