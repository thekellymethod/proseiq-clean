import Template from "@/components/layout/Template";
import { getUserOrRedirect } from "@/lib/auth/getAuth";
import AccountClient from "@/components/account/AccountClient";

export default async function AccountPage() {
  const { user, supabase } = await getUserOrRedirect();

  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasSerper = Boolean(process.env.SERPER_API_KEY);

  const { data: sub } = await supabase
    .from("billing_subscriptions")
    .select("status, current_period_end, cancel_at_period_end, price_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <Template
      title="Account"
      subtitle="Plan, preferences, and profile."
      variant="settings"
    >
      <AccountClient
        user={{
          id: user.id,
          email: user.email ?? "",
          created_at: (user as any).created_at ?? null,
          user_metadata: (user as any).user_metadata ?? {},
        }}
        config={{
          openaiConfigured: hasOpenAI,
          serperConfigured: hasSerper,
          model: process.env.OPENAI_MODEL ?? null,
        }}
        billing={{
          status: sub?.status ?? null,
          current_period_end: sub?.current_period_end ?? null,
          cancel_at_period_end: sub?.cancel_at_period_end ?? null,
          price_id: sub?.price_id ?? null,
          plan: sub?.price_id === process.env.STRIPE_PRICE_ID_PRO ? "pro" : sub?.price_id ? "basic" : null,
        }}
      />
    </Template>
  );
}

