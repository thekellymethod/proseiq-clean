import type { ReactNode } from "react";
import Template from "@/components/layout/Template";
import CaseTabs, { type TabKey } from "@/components/case/CaseTabs";
import CaseHeaderActions from "@/components/case/CaseHeaderActions";
import { getCaseById } from "@/lib/cases";
import { getPlanForUser } from "@/lib/billing/plan";

export default async function CaseWorkspaceShell({
  caseId,
  active,
  children,
}: {
  caseId: string;
  active?: TabKey;
  children: ReactNode;
}) {
  const [c, plan] = await Promise.all([getCaseById(caseId), getPlanForUser()]);

  return (
    <Template
      title={c?.title ?? "Case"}
      subtitle="Case workspace"
      actions={<CaseHeaderActions caseId={caseId} status={c?.status ?? "active"} />}
    >
      <div className="space-y-4">
        <CaseTabs caseId={caseId} active={active} plan={plan} />
        {children}
      </div>
    </Template>
  );
}
