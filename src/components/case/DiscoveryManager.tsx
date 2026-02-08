import CaseTasks from "@/components/case/CaseTasks";

export default function DiscoveryManager({ caseId }: { caseId: string }) {
  // MVP: treat discovery as structured tasks (requests, responses, follow-ups).
  return <CaseTasks caseId={caseId} />;
}
