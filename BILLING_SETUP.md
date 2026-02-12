# Stripe Billing Setup

## 1. Run SQL in Supabase

Execute the contents of `supabase/migrations/20250210000000_billing_tables.sql` in the Supabase SQL editor.

## 2. Environment Variables

Add to `.env.local` and production:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...   # optional

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

## 4. Gating Paid Features

Use `requireActiveSubscription()` from `@/lib/billing/requireActiveSub` in API routes that require an active subscription:

```ts
const { supabase, user, res } = await requireActiveSubscription();
if (res) return res;
// ... user has active subscription
```
