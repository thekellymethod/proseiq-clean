# Stripe Billing Setup

## 1. Run SQL in Supabase

Execute the contents of `supabase/migrations/20250210000000_billing_tables.sql` in the Supabase SQL editor.

## 2. Environment Variables

Add to `.env.local` and production:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...   # $29/mo
STRIPE_PRICE_ID_PRO=price_...     # $59/mo

# App URL (use real domain in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (service role required for webhook)
SUPABASE_SERVICE_ROLE_KEY=...
```

## 3. Stripe Webhook

In Stripe Dashboard → Developers → Webhooks:

- **Endpoint:** `https://YOUR_DOMAIN/api/billing/webhook`
- **Events:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

## 4. Plans

| Plan   | Env var              | Price   | Included features |
|--------|----------------------|---------|-------------------|
| Basic  | `STRIPE_PRICE_ID_BASIC` | $29/mo  | Case workspace, events, documents, exhibits, drafts, export, bundles, tasks |
| Pro    | `STRIPE_PRICE_ID_PRO`   | $59/mo  | Basic + 3D timeline, legal research, AI Assistant, coaching tools |

## 5. Gating Paid Features

Use `requireActiveSubscription()` from `@/lib/billing/requireActiveSub`:

```ts
const { supabase, user, res, plan } = await requireActiveSubscription();
if (res) return res;
// plan is "basic" | "pro"
```

To gate Pro-only features:

```ts
import { isProPlan } from "@/lib/billing/plan";

if (sub.price_id === process.env.STRIPE_PRICE_ID_PRO) {
  // allow pro features
}
```
