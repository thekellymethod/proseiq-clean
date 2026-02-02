"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [loading, setLoading] = React.useState(false);

  async function signOut() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="border rounded-md px-3 py-2" onClick={signOut} disabled={loading}>
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
