
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseExhibits from "@/components/case/CaseExhibits";


export default async function CaseExhibitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="exhibits">
      <CaseExhibits caseId={id} />
    </CaseWorkspaceShell>
  );
}
