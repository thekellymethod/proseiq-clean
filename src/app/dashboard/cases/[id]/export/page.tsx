import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import ExportPanel from "@/components/case/ExportPanel";
import { getCaseById } from "@/lib/cases";

export default async function CaseExportPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Export">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="export">
        <ExportPanel caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
