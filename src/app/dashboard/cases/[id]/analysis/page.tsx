import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseAnalysis from "@/components/case/CaseAnalysis";
import { getCaseById } from "@/lib/cases";

export default async function CaseAnalysisPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Analysis">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="analysis">
        <CaseAnalysis caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
