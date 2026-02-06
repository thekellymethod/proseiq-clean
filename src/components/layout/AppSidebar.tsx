import Link from "next/link";

type Item = { href: string; label: string; hint?: string };

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/cases", label: "Cases", hint: "Your matters" },
  { href: "/dashboard/research", label: "Research", hint: "Sources" },
  { href: "/dashboard/export", label: "Export", hint: "Packets" },
];

export default function AppSidebar({ activeHref }: { activeHref?: string }) {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="px-2 py-2 text-xs font-semibold text-white/60">NAVIGATION</div>
        <div className="space-y-1">
          {ITEMS.map((i) => {
            const active = activeHref && activeHref.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={[
                  "block rounded-xl border px-3 py-2",
                  active ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-white/10 bg-black/10 text-white/70 hover:bg-black/20 hover:text-white",
                ].join(" ")}
              >
                <div className="text-sm font-medium">{i.label}</div>
                {i.hint ? <div className="text-xs opacity-70">{i.hint}</div> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
