import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseMotions from "@/components/case/CaseMotions";
import { getCaseById } from "@/lib/cases";

export default async function CaseMotionsPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Motions">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="motions">
        <CaseMotions caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
