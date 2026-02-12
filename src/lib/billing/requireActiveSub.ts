import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function requireActiveSubscription() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return { supabase, user: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("status")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ok = sub?.status === "active" || sub?.status === "trialing";
  if (!ok) {
    return {
      supabase,
      user: auth.user,
      res: NextResponse.json({ error: "Payment required" }, { status: 402 }),
    };
  }

  return { supabase, user: auth.user, res: null };
}
