
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import { CaseParties } from "@/components/case/CaseParties";
import { getCaseById } from "@/lib/cases";

export default async function CaseParties({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <CaseParties caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
