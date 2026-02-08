// src/app/dashboard/cases/[id]/timeline/page.tsx
import CaseWorkspaceShell from "@/components/case/CaseWorkspaceShell";
import CaseTimeline from "@/components/case/CaseTimeline";
import { getCaseById } from "@/lib/cases";

export default async function CaseTimelinePage({ params }: { params: { id: string } }) {
  const c = await getCaseById(params.id);

}
