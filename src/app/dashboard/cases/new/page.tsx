
import Template from "@/components/layout/Template";
import NewCaseWizard from "@/components/case/NewCaseWizard";

export default function NewCasePage() {
  return (
    <Template title="New case" subtitle="Create a matter and complete a short intake.">
      <NewCaseWizard />
    </Template>
  );
}
