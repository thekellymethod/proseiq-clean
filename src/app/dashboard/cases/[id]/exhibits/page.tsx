import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseExhibits from "@/components/case/CaseExhibits";
import { getCaseById } from "@/lib/cases";

export default async function CaseExhibitsPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Exhibits">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="exhibits">
        <CaseExhibits caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
