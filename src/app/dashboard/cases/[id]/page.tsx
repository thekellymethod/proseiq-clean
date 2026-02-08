// src/app/dashboard/cases/[id]/page.tsx
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseStrategy from "@/components/case/CaseStrategy"; // or your real "workspace home" component

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  return (
    <CaseWorkspaceShell caseId={params.id} active="overview">
      {/* Workspace "home" content goes here */}
      <CaseStrategy caseId={params.id} />
    </CaseWorkspaceShell>
  );
}
