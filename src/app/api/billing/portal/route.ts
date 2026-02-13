import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return NextResponse.json({ error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });

  const { data: cust, error: custErr } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (custErr) return NextResponse.json({ error: custErr.message }, { status: 500 });

  if (!cust?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found. Upgrade first." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: cust.stripe_customer_id,
    return_url: `${appUrl}/dashboard/account`,
  });

  return NextResponse.json({ url: portal.url });
}
