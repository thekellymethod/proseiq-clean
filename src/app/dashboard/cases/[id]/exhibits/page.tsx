
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseExhibits from "@/components/case/CaseExhibits";
import { getCaseById } from "@/lib/cases";


export default async function CaseExhibits({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <CaseExhibits caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
