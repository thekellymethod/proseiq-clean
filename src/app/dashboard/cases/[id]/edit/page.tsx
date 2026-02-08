import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseSettings from "@/components/case/CaseSettings";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="edit">
      <CaseSettings caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
