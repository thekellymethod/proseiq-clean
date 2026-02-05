
import Template from "@/components/layout/Template";
import CaseIntakeWizard from "@/components/case/CaseIntakeWizard";

export default async function CaseIntakePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Template
      title="Case intake"
      subtitle="Enter the core facts so ProseIQ can seed your timeline, exhibits, and drafting workspace."
    >
      <CaseIntakeWizard caseId={params.id} />
    </Template>
  );
}
