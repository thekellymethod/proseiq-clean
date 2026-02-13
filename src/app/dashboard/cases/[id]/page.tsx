// src/app/dashboard/cases/[id]/page.tsx
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseStrategy from "@/components/case/CaseStrategy"; // or your real "workspace home" component

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <CaseWorkspaceShell caseId={id} active="overview">
      {/* Workspace "home" content goes here */}
      <CaseStrategy caseId={id} />
    </CaseWorkspaceShell>
  );
}
