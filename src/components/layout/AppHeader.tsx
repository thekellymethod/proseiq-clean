import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/cases", label: "Cases" },
  { href: "/dashboard/research", label: "Research" },
  { href: "/dashboard/account", label: "Account" },
];

export default async function AppHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.PNG"
              alt="ProseIQ"
              width={56}
              height={56}
              priority
              className="h-14 w-14 rounded-xl"
            />
            <div className="leading-tight">
              <div className="text-base font-semibold text-white">ProseIQ</div>
              <div className="text-xs text-white/60">Pro se litigation cockpit</div>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden sm:block rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
              {user.email ?? "Signed in"}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
