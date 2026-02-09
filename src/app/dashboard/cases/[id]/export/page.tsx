
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";


export default async function CaseExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="export">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-white font-semibold">Export</h2>
        <p className="text-sm text-white/70">Coming soon:Export your case to a PDF or DOCX file.</p>
      </div>
    </CaseWorkspaceShell>
  );
}
