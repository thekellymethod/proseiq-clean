import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DiscoveryManager from "@/components/case/DiscoveryManager";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="discovery">
      <DiscoveryManager caseId={id} />
    </CaseWorkspaceShell>
  );
}
