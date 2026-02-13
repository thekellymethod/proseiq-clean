"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { setSplashOnSignOut } from "@/components/dashboard/AuthSplashGate";

export default function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    setSplashOnSignOut();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={onSignOut}
      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
      type="button"
    >
      Sign out
    </button>
  );
}
