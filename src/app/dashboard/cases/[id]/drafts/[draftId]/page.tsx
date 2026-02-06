import Template from "@/components/layout/Template";
import DraftEditor from "@/components/case/DraftEditor";

export default function DraftEditorPage({ params }: { params: { id: string; draftId: string } }) {
  return (
    <Template title="Draft" subtitle="Editor">
      <DraftEditor caseId={params.id} draftId={params.draftId} />
    </Template>
  );
}
