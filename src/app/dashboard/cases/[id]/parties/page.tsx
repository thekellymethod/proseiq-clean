import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseParties from "@/components/case/CaseParties";
import { getCaseById } from "@/lib/cases";

export default async function CasePartiesPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Parties">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="parties">
        <CaseParties caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
