import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseAnalysis from "@/components/case/CaseAnalysis";
import ProGate from "@/components/billing/ProGate";
import { getPlanForUser } from "@/lib/billing/plan";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanForUser();
  return (
    <CaseWorkspaceShell caseId={id} active="analysis">
      {plan === "pro" ? <CaseAnalysis caseId={id} /> : <ProGate feature="analysis" />}
    </CaseWorkspaceShell>
  );
}
