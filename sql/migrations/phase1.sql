-- Phase 1 MVP tables inferred from API/routes
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.case_parties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  role text not null default 'other',
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.case_intake (
  case_id uuid primary key references public.cases(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_intake_set_updated_at
before update on public.case_intake
for each row
execute procedure public.set_updated_at();

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  filename text not null,
  mime_type text,
  byte_size bigint,
  storage_bucket text,
  storage_path text,
  status text not null default 'ready',
  notes text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_documents_set_updated_at
before update on public.case_documents
for each row
execute procedure public.set_updated_at();

create table if not exists public.case_exhibits (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  exhibit_index integer not null,
  exhibit_label text,
  title text not null,
  description text,
  kind text not null default 'document',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_exhibits_set_updated_at
before update on public.case_exhibits
for each row
execute procedure public.set_updated_at();

create table if not exists public.case_drafts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  kind text not null default 'draft',
  status text not null default 'draft',
  content_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_drafts_set_updated_at
before update on public.case_drafts
for each row
execute procedure public.set_updated_at();

create table if not exists public.case_bundles (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null default 'Bundle',
  status text not null default 'queued',
  manifest jsonb not null default '{}'::jsonb,
  storage_bucket text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_bundles_set_updated_at
before update on public.case_bundles
for each row
execute procedure public.set_updated_at();
