import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseSettings from "@/components/case/CaseSettings";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="edit">
      <CaseSettings caseId={id} />
    </CaseWorkspaceShell>
  );
}
