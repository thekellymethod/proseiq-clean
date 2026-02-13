import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseAssistantPanel from "@/components/case/CaseAssistantPanel";
import ProGate from "@/components/billing/ProGate";
import { getPlanForUser } from "@/lib/billing/plan";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanForUser();
  return (
    <CaseWorkspaceShell caseId={id} active="assistant">
      {plan === "pro" ? <CaseAssistantPanel caseId={id} /> : <ProGate feature="assistant" />}
    </CaseWorkspaceShell>
  );
}

