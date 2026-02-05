import Link from "next/link";
import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";

import CaseTimeline from "@/components/case/CaseTimeline";
import CaseStrategy from "@/components/case/CaseStrategy";
import CaseMotions from "@/components/case/CaseMotions";
import DamagesCalculator from "@/components/case/DamagesCalculator";
import CaseDocuments from "@/components/case/CaseDocuments";
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";

export default async function CaseWorkspacePage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

  return (
    <Template
      title="Case"
      subtitle="Overview"
      actions={
        <div className="flex gap-2">
          <Link
            href={`/dashboard/cases/${params.id}/intake`}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Intake
          </Link>
          <Link
            href={`/dashboard/cases/${params.id}/timeline`}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Timeline
          </Link>
          <Link
            href={`/dashboard/cases/${params.id}/tasks`}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Tasks
          </Link>
        </div>
      }
    >
      <CaseWorkspaceShell
        caseId={params.id}
        title={c.title}
        subtitle={`${c.case_type ?? "general"} • ${c.status ?? "intake"} • ${c.priority ?? "normal"}`}
        active="overview"
      >
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