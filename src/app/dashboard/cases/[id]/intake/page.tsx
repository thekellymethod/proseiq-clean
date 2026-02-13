import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import IntakeForm from "@/components/case/IntakeForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="intake">
      <IntakeForm caseId={id} />
    </CaseWorkspaceShell>
  );
}
