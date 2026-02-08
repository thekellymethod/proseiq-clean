import CaseStrategy from "@/components/case/CaseStrategy";

export default function CaseAnalysis({ caseId }: { caseId: string }) {
  return <CaseStrategy caseId={caseId} />;
}
