import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseSettings from "@/components/case/CaseSettings";
import { getCaseById } from "@/lib/cases";

export default async function CaseEditPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Case Settings">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="edit">
        <CaseSettings caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
