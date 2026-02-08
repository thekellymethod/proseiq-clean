import DraftsEditor from "@/components/drafts/DraftsEditor";

export default function DraftEditor({ caseId, draftId }: { caseId: string; draftId: string }) {
  return <DraftsEditor caseId={caseId} draftId={draftId} />;
}
