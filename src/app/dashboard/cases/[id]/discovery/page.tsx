import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DiscoveryManager from "@/components/case/DiscoveryManager";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="discovery">
      <DiscoveryManager caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
