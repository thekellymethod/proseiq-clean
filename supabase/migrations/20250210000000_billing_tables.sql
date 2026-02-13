-- Run this in Supabase SQL editor if not using migrations

-- 1) Stripe customer mapping
create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;

create policy "billing_customers_select_own"
on public.billing_customers
for select
using (auth.uid() = user_id);

-- 2) Subscription state
create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text not null unique,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_id_idx
on public.billing_subscriptions(user_id);

alter table public.billing_subscriptions enable row level security;

create policy "billing_subscriptions_select_own"
on public.billing_subscriptions
for select
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row execute function public.set_updated_at();
