import Link from "next/link";
import Template from "@/components/layout/Template";
import { listCases } from "@/lib/cases";

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function statusLabel(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "Active";
  if (s === "paused") return "Paused";
  if (s === "archived") return "Archived";
  if (s === "closed") return "Closed";
  return status || "Unknown";
}

export default async function CasesIndexPage() {
  const cases = await listCases();

  return (
    <Template
      title="Cases"
      subtitle="Your matters, organized."
      actions={
        <Link
          href="/dashboard/cases/new"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          New Case
        </Link>
      }
    >
      {cases.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          No cases yet. Create your first matter to get started.
        </div>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/cases/${c.id}`}
              className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{c.title}</div>
                  <div className="text-xs text-white/60">
                    Updated {fmt(c.updated_at)}{c.description ? ` • ${c.description}` : ""}
                  </div>
                </div>
                <div className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70">
                  {statusLabel(c.status)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Template>
  );
}
