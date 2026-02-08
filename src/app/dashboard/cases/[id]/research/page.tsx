import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import ResearchManager from "@/components/case/ResearchManager";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="research">
      <ResearchManager caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
