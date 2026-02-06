import Link from "next/link";
import Template from "@/components/layout/Template";
import { getCaseById } from "@/lib/cases";
import DraftsPanel from "@/components/case/DraftsPanel";

export default async function CaseDraftsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const c = await getCaseById(params.id);

  return (
    <Template
      title={`${c.title} — Drafts`}
      subtitle="Draft, autosave, snapshot versions, export."
      actions={
        <Link
          href={`/dashboard/cases/${params.id}`}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          Back to Case
        </Link>
      }
    >
      <DraftsPanel caseId={params.id} />
    </Template>
  );
}
