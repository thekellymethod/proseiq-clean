import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { isProPlan } from "./plan";
import { isAdminUser } from "./admin";

export async function requireActiveSubscription() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return { supabase, user: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (isAdminUser(auth.user.email)) {
    return { supabase, user: auth.user, res: null, plan: "pro" as const };
  }

  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("status, price_id")
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

  return {
    supabase,
    user: auth.user,
    res: null,
    plan: isProPlan(sub?.price_id) ? "pro" : "basic",
  };
}

/** For Pro-only API routes. Returns 402 if user is not on Pro plan. */
export async function requireProPlan() {
  const result = await requireActiveSubscription();
  if (result.res) return result;
  if (result.plan !== "pro") {
    return {
      ...result,
      res: NextResponse.json(
        { error: "Pro plan required. Upgrade to access Research, AI Assistant, and 3D Timeline." },
        { status: 402 }
      ),
    };
  }
  return result;
}
