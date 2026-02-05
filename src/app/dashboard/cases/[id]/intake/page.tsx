
import Template from "@/components/layout/Template";
import CaseIntakeWizard from "@/components/case/CaseIntakeWizard";

export default function CaseIntakePage({ params }: { params: { id: string } }) {
  return (
    <Template
      title="Case intake"
      subtitle="Enter the core facts so ProseIQ can seed your timeline, exhibits, and drafting workspace."
    >
      <CaseIntakeWizard caseId={params.id} />
    </Template>
  );
}
