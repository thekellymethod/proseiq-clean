import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseExhibits from "@/components/case/CaseExhibits";

export default async function CaseExhibitsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const c = await getCaseById(params.id);

  return (
    <Template title="Case" subtitle="Exhibits">
      <CaseWorkspaceShell
        caseId={params.id}
        title={c.title}
        subtitle={`${c?.case_type ?? "general"} • ${c?.status ?? "intake"} • ${c?.priority ?? "normal"}`}
        active="exhibits"
      >
        <CaseExhibits caseId={params.id} />
      </CaseWorkspaceShell>
    </Template>
  );
}   