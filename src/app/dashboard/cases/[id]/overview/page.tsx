import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import { getCaseById } from "@/lib/cases";

export default async function CaseOverviewPage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Overview">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="overview">
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-white font-semibold">Case Summary</h3>
          <div className="mt-3 text-sm text-white/80">
            <div>Status: {c.status}</div>
            <div>Type: {c.case_type ?? "General"}</div>
            <div>Priority: {c.priority ?? "Normal"}</div>
          </div>
        </section>
      </CaseWorkspaceShell>
    </Template>
  );
}
