//dashboard.jsx
import Link from "next/link";
import Template from "@/components/layout/Template";
import { listCases } from "@/lib/cases";

export default async function DashboardPage() {
  const cases = await listCases();

  const active = cases.filter(c => c.status !== "closed" && c.status !== "settled");
  const urgent = cases.filter(c => c.priority === "urgent" || c.priority === "high");

  return (
    <Template
      title="Dashboard"
      subtitle="Active matters, urgency, and next moves."
      actions={
        <Link
          href="/dashboard/cases/new"
          className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
        >
          New Case
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Active Cases" value={active.length} />
        <Stat label="Urgent Matters" value={urgent.length} />
        <Stat label="Drafting Queue" value={0} />
        <Stat label="Deadlines" value={0} />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-white/80">Recent Cases</h2>
        <div className="mt-3 space-y-2">
          {cases.slice(0, 5).map(c => (
            <Link
              key={c.id}
              href={`/dashboard/cases/${c.id}`}
              className="block rounded-lg border border-white/10 bg-black/20 p-3 hover:bg-black/30"
            >
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-white/60">
                {c.case_type} • {c.priority}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Template>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-amber-200">{value}</div>
    </div>
  );
}
