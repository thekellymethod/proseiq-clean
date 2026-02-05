import Template from "@/components/layout/Template";
import DraftEditor from "@/components/drafts/DraftEditor";

export default function DraftEditorPage({ params }: { params: { draftId: string } }) {
  return (
    <Template title="Draft Editor" subtitle="Autosave + versions + export">
      <DraftEditor draftId={params.draftId} />
    </Template>
  );
}
