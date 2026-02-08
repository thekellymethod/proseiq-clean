import DraftsEditor from "@/components/drafts/DraftsEditor";


export default async function DraftEditor({ params }: { params: { id: string } }) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="analysis">
      <DraftsEditor caseId={params.id} />
    </CaseWorkspaceShell>
  );
}