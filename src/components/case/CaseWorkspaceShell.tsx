import type { ReactNode } from "react";
import Template from "@/components/layout/Template";
import CaseTabs from "@/components/case/CaseTabs";
import CaseHeaderActions from "@/components/case/CaseHeaderActions";
import { getCaseById } from "@/lib/cases";

export default async function CaseWorkspaceShell({
  caseId,
  active,
  children,
}: {
  caseId: string;
  active?: any;
  children: ReactNode;
}) {
  const c = await getCaseById(caseId);

  return (
    <Template
      title={c?.title ?? "Case"}
      subtitle="Case workspace"
      actions={<CaseHeaderActions caseId={caseId} status={c?.status ?? "active"} />}
    >
      <div className="space-y-4">
        <CaseTabs caseId={caseId} active={active} />
        {children}
      </div>
    </Template>
  );
}
