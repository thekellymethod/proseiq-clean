//case.jsx

import Link from "next/link";
import Template from "@/components/layout/Template";
import { listCases } from "@/lib/cases";

export default async function CasesPage() {
  const cases = await listCases();

  return (
    <Template
      title="Cases"
      subtitle="Each case is a workspace: facts, filings, strategy, damages."
      actions={
        <Link
          href="/dashboard/cases/new"
          className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100"
        >
          New Case
        </Link>
      }
    >
      <div className="space-y-2">
        {cases.map(c => (
          <Link
            key={c.id}
            href={`/dashboard/cases/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 hover:bg-black/30"
          >
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-white/60">{c.case_type}</div>
            </div>
            <span className="text-xs text-white/50">{c.status}</span>
          </Link>
        ))}
      </div>
    </Template>
  );
}
