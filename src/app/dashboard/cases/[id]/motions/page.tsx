
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseMotions from "@/components/case/CaseMotions";
import { getCaseById } from "@/lib/cases";


export default async function CaseMotionsPage({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <CaseMotions caseId={params.id} />
    </CaseWorkspaceShell>
  );
}

