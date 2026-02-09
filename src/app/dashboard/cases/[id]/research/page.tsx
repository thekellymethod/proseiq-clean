import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import ResearchManager from "@/components/case/ResearchManager";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="research">
      <ResearchManager caseId={id} />
    </CaseWorkspaceShell>
  );
}
