
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import ExportPanel from "@/components/case/ExportPanel";
import { getCaseById } from "@/lib/cases";


export default async function ExportPanel({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <ExportPanel caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
