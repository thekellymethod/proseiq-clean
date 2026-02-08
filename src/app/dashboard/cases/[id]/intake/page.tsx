import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import IntakeForm from "@/components/case/IntakeForm";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="intake">
      <IntakeForm caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
