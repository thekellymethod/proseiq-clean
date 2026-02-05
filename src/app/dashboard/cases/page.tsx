
import Link from "next/link";
import Template from "@/components/layout/Template";
import { listCases } from "@/lib/cases";

export default async function CasesIndexPage() {
  const items = await listCases();

  return (
    <Template
      title="Cases"
      subtitle="Your active and archived matters."
      actions={
        <Link
          href="/dashboard/cases/new"
          className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
        >
          New Case
        </Link>
      }
    >
      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No cases yet. Create one to start building your timeline, exhibits, and filings.
          </div>
        ) : (
          items.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/cases/${c.id}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-white font-medium">{c.title}</div>
                  <div className="text-xs text-white/60">
                    {c.case_type ?? "General"} • {c.status ?? "Intake"} • {c.priority ?? "Normal"}
                  </div>
                </div>
                <div className="text-xs text-white/50">Open</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Template>
  );
}
