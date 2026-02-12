import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export const runtime = "nodejs";

function toIso(ts?: number | null) {
  if (!ts) return null;
  return new Date(ts * 1000).toISOString();
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const admin = createAdminClient();

  const stripeCustomerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const { data: map } = await admin
    .from("billing_customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  let userId = map?.user_id as string | null;
  const metaUserId = (sub.metadata?.user_id as string) || null;
  if (!userId && metaUserId) {
    userId = metaUserId;
    await admin.from("billing_customers").upsert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
    });
  }

  if (!userId) return;

  const firstItem = sub.items.data[0];
  const priceId = firstItem?.price?.id ?? null;
  const currentPeriodEnd = firstItem?.current_period_end ?? null;

  const payload = {
    user_id: userId,
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: priceId,
    current_period_end: toIso(currentPeriodEnd),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
  };

  await admin.from("billing_subscriptions").upsert(payload, {
    onConflict: "stripe_subscription_id",
  });
}

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whSecret) {
    return NextResponse.json(
      { error: "Missing stripe signature or webhook secret" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${msg}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const admin = createAdminClient();

        const userId = (session.metadata?.user_id as string) || null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (userId && customerId) {
          await admin.from("billing_customers").upsert({
            user_id: userId,
            stripe_customer_id: customerId,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertFromSubscription(sub);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
