import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DiscoveryManager from "@/components/case/DiscoveryManager";
import { getCaseById } from "@/lib/cases";

export default async function CaseDiscoveryPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Discovery">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="discovery">
        <DiscoveryManager caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
