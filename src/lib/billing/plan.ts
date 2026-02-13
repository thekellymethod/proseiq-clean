import { createClient } from "@/utils/supabase/server";

/**
 * Check if a subscription's price_id entitles the user to Pro features.
 */
export function isProPlan(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  return priceId === process.env.STRIPE_PRICE_ID_PRO;
}

/**
 * Get the current user's plan from their subscription. Returns "pro" | "basic" | null.
 */
export async function getPlanForUser(): Promise<"pro" | "basic" | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("status, price_id")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const active = sub?.status === "active" || sub?.status === "trialing";
  if (!active || !sub?.price_id) return null;

  return isProPlan(sub.price_id) ? "pro" : "basic";
}
