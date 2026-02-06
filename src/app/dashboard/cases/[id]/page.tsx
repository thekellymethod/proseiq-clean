import Template from "@/components/layout/Template";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import { getCaseById } from "@/lib/cases";
import CaseTimeline from "@/components/case/CaseTimeline";
import CaseStrategy from "@/components/case/CaseStrategy";
import CaseMotions from "@/components/case/CaseMotions";
import DamagesCalculator from "@/components/case/DamagesCalculator";
import CaseDocuments from "@/components/case/CaseDocuments";

export default async function CaseWorkspaceHome({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template title={c.title} subtitle="Case workspace">
      <CaseWorkspaceShell caseId={params.id} title={c.title} active="overview">
        <div className="grid gap-4 lg:grid-cols-2">
          <CaseTimeline caseId={params.id} />
          <CaseStrategy caseId={params.id} />
          <CaseMotions caseId={params.id} />
          <DamagesCalculator caseId={params.id} />
          <div className="lg:col-span-2">
            <CaseDocuments caseId={params.id} />
          </div>
        </div>
      </CaseWorkspaceShell>
    </Template>
  );
}
