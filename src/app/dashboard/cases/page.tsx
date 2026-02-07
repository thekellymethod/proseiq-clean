// src/app/dashboard/cases/[id]/page.tsx
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";

export default async function CaseWorkspaceHomePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="overview">
      {/* your workspace home content here */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
        Workspace home
      </div>
    </CaseWorkspaceShell>
  );
}
