import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import DraftsManager from "@/components/case/DraftsManager";
import { getCaseById } from "@/lib/cases";

export default async function CaseDraftsPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Drafts">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="drafts">
        <DraftsManager caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}
