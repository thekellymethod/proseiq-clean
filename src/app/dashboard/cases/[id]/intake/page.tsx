import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import IntakeForm from "@/components/case/IntakeForm";
import { getCaseById } from "@/lib/cases";

export default async function CaseIntakePage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Case Intake">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="intake">
        <IntakeForm caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
