import Link from "next/link";
import ArchiveCaseButton from "@/components/case/ArchiveCaseButton";

export default function CaseHeaderActions({
  caseId,
  status,
}: {
  caseId: string;
  status?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ArchiveCaseButton caseId={caseId} currentStatus={status ?? "active"} />
      <Link
        href={`/dashboard/cases/${caseId}/analysis`}
        className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        Analysis
      </Link>
      <Link
        href={`/dashboard/cases/${caseId}/edit`}
        className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
      >
        Settings
      </Link>
    </div>
  );
}
