import CaseLawSection from "@/components/case/CaseLawSection";

export default function ResearchManager({ caseId }: { caseId: string }) {
  // MVP: reuse existing research widget.
  return <CaseLawSection caseId={caseId} />;
}
