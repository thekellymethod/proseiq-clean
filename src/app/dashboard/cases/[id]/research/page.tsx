import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import ResearchManager from "@/components/case/ResearchManager";
import ProGate from "@/components/billing/ProGate";
import { getPlanForUser } from "@/lib/billing/plan";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanForUser();
  return (
    <CaseWorkspaceShell caseId={id} active="research">
      {plan === "pro" ? <ResearchManager caseId={id} /> : <ProGate feature="research" />}
    </CaseWorkspaceShell>
  );
}
