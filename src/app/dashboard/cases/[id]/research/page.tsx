import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import ResearchManager from "@/components/case/ResearchManager";
import { getCaseById } from "@/lib/cases";

export default async function CaseResearchPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Research">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="research">
        <ResearchManager caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
