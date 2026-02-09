//src/components/case/IntakeForm.tsx
import IntakeWizard from "@/components/intake/IntakeWizard";

export default function IntakeForm({ caseId }: { caseId: string }) {
  return <IntakeWizard caseId={caseId} />;
}
