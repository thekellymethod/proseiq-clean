import Template from "@/components/layout/Template";
import DraftEditor from "@/components/drafts/DraftEditor";

export default async function DraftEditorPage(props: { params: Promise<{ draftId: string }> }) {
  const params = await props.params;
  return (
    <Template title="Draft Editor" subtitle="Autosave + versions + export">
      <DraftEditor draftId={params.draftId} />
    </Template>
  );
}
