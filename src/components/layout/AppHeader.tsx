import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export default async function AppHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  return (
    <header className="sticky top-0 z-[200] border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <Image
            src="/proseiq-logo-512-a.png"
            alt="ProseIQ"
            width={42}
            height={42}
            priority
          />
          <div className="leading-tight">
            <div className="text-base font-semibold text-white tracking-tight">ProseIQ</div>
            <div className="text-[12px] text-white/60">Pro se case workspace</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/cases"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Cases
              </Link>
              <Link
                href="/dashboard/cases/new"
                className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
              >
                New Case
              </Link>

              <form action="/auth/signout" method="post">
                <button
                  className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/70 hover:bg-black/30"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-300/20"
              >
                Enter app
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}