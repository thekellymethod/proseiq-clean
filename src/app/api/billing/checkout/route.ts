import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan = body?.plan === "pro" ? "pro" : "basic";

  const priceId =
    plan === "pro"
      ? process.env.STRIPE_PRICE_ID_PRO
      : process.env.STRIPE_PRICE_ID_BASIC;

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing Stripe price env var for selected plan" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return NextResponse.json({ error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });

  // Reuse existing Stripe customer if we have one
  const { data: existing } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  let customerId: string;
  if (existing?.stripe_customer_id) {
    customerId = existing.stripe_customer_id;
  } else {
    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email: auth.user.email ?? undefined,
      metadata: { user_id: auth.user.id },
    });
    customerId = customer.id;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/dashboard/account?billing=success`,
    cancel_url: `${appUrl}/dashboard/account?billing=cancel`,
    subscription_data: {
      metadata: { user_id: auth.user.id },
    },
    metadata: { user_id: auth.user.id },
  });

  return NextResponse.json({ url: session.url });
}
