-- Full ProseIQ schema: tables, RLS policies, storage buckets
-- Run in Supabase SQL editor. Adjust if you already have partial schema.
-- Tables reference auth.users and public.cases - ensure those exist first.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ========== CORE TABLES ==========

-- cases (expected to exist; add created_by if missing)
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete cascade,
  user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_created_by_idx on public.cases(created_by);

-- case_intakes (app uses "intake" column; phase1 has case_intake with "data")
create table if not exists public.case_intakes (
  case_id uuid primary key references public.cases(id) on delete cascade,
  intake jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_intakes_set_updated_at before update on public.case_intakes
for each row execute procedure public.set_updated_at();

-- case_events
create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  event_at timestamptz not null,
  kind text not null default 'note',
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists case_events_case_id_idx on public.case_events(case_id);

-- case_parties
create table if not exists public.case_parties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  role text not null default 'other',
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists case_parties_case_id_idx on public.case_parties(case_id);

-- case_drafts (extended from phase1: content_rich, template_id, signature fields)
create table if not exists public.case_drafts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  kind text not null default 'draft',
  status text not null default 'draft',
  content_md text,
  content text,
  content_rich jsonb,
  content_rich_updated_at timestamptz,
  template_id text,
  signature_bucket text,
  signature_path text,
  signature_name text,
  signature_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_drafts_case_id_idx on public.case_drafts(case_id);
create trigger case_drafts_set_updated_at before update on public.case_drafts
for each row execute procedure public.set_updated_at();

-- case_exhibits (exhibit_index/exhibit_label for legacy; exhibit_no/label for API)
create table if not exists public.case_exhibits (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  exhibit_index integer,
  exhibit_label text,
  exhibit_no integer,
  label text,
  title text not null,
  description text,
  kind text not null default 'document',
  sort_order integer not null default 0,
  proof_notes text,
  source text,
  file_path text,
  url text,
  created_by uuid references auth.users(id) on delete set null,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_exhibits_case_id_idx on public.case_exhibits(case_id);
create trigger case_exhibits_set_updated_at before update on public.case_exhibits
for each row execute procedure public.set_updated_at();

-- case_tasks
create table if not exists public.case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_tasks_case_id_idx on public.case_tasks(case_id);

-- case_bundles (manifest jsonb; storage_bucket, storage_path for output)
create table if not exists public.case_bundles (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  created_by uuid references auth.users(id) on delete cascade,
  title text not null default 'Bundle',
  status text not null default 'queued',
  kind text not null default 'exhibits',
  include_bates boolean not null default false,
  bates_prefix text,
  bates_start integer,
  manifest jsonb not null default '{}'::jsonb,
  storage_bucket text,
  storage_path text,
  output_path text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_bundles_case_id_idx on public.case_bundles(case_id);
create trigger case_bundles_set_updated_at before update on public.case_bundles
for each row execute procedure public.set_updated_at();

-- case_bundle_items (for exhibit-based bundles)
create table if not exists public.case_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.case_bundles(id) on delete cascade,
  exhibit_id uuid references public.case_exhibits(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists case_bundle_items_bundle_id_idx on public.case_bundle_items(bundle_id);

-- case_ai_jobs
create table if not exists public.case_ai_jobs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  job_type text not null,
  source_type text,
  source_id text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  attempts integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists case_ai_jobs_case_id_idx on public.case_ai_jobs(case_id);
create index if not exists case_ai_jobs_created_by_status_idx on public.case_ai_jobs(created_by, status);

-- case_ai_outputs
create table if not exists public.case_ai_outputs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  output_type text not null,
  source_type text,
  source_id text,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  metadata jsonb,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_ai_outputs_case_id_idx on public.case_ai_outputs(case_id);
create index if not exists case_ai_outputs_created_by_idx on public.case_ai_outputs(created_by);

-- case_exhibit_documents (junction: exhibits <-> documents)
create table if not exists public.case_exhibit_documents (
  id uuid primary key default gen_random_uuid(),
  exhibit_id uuid not null references public.case_exhibits(id) on delete cascade,
  document_id uuid not null,
  created_at timestamptz not null default now(),
  unique(exhibit_id, document_id)
);

create index if not exists case_exhibit_documents_exhibit_id_idx on public.case_exhibit_documents(exhibit_id);

-- ========== RLS (Row Level Security) ==========
-- Enable RLS on tables that need it. Policies assume cases.created_by = auth.uid() for ownership.
-- For tables scoped by case_id, add policies that join to cases and check created_by.

-- Note: Supabase RLS with anon key requires policies. Service role bypasses RLS.
-- Below are minimal policies; expand based on your auth model.

alter table public.cases enable row level security;
alter table public.case_intakes enable row level security;
alter table public.case_events enable row level security;
alter table public.case_parties enable row level security;
alter table public.case_drafts enable row level security;
alter table public.case_exhibits enable row level security;
alter table public.case_tasks enable row level security;
alter table public.case_bundles enable row level security;
alter table public.case_ai_jobs enable row level security;
alter table public.case_ai_outputs enable row level security;

-- Cases: users see only their own
drop policy if exists "cases_all_own" on public.cases;
create policy "cases_all_own" on public.cases for all using (auth.uid() = created_by);

-- Case-scoped tables: allow if user owns the case
drop policy if exists "case_intakes_own" on public.case_intakes;
create policy "case_intakes_own" on public.case_intakes for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_events_own" on public.case_events;
create policy "case_events_own" on public.case_events for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_parties_own" on public.case_parties;
create policy "case_parties_own" on public.case_parties for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_drafts_own" on public.case_drafts;
create policy "case_drafts_own" on public.case_drafts for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_exhibits_own" on public.case_exhibits;
create policy "case_exhibits_own" on public.case_exhibits for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_tasks_own" on public.case_tasks;
create policy "case_tasks_own" on public.case_tasks for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_bundles_own" on public.case_bundles;
create policy "case_bundles_own" on public.case_bundles for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));

drop policy if exists "case_ai_jobs_own" on public.case_ai_jobs;
create policy "case_ai_jobs_own" on public.case_ai_jobs for all using (auth.uid() = created_by);

drop policy if exists "case_ai_outputs_own" on public.case_ai_outputs;
create policy "case_ai_outputs_own" on public.case_ai_outputs for all using (auth.uid() = created_by);

-- case_exhibit_documents: allow if user owns the exhibit's case
alter table public.case_exhibit_documents enable row level security;
drop policy if exists "case_exhibit_documents_own" on public.case_exhibit_documents;
create policy "case_exhibit_documents_own" on public.case_exhibit_documents for all
using (exists (
  select 1 from public.case_exhibits e
  join public.cases c on c.id = e.case_id
  where e.id = exhibit_id and c.created_by = auth.uid()
));

-- case_bundle_items: allow if user owns the bundle's case
alter table public.case_bundle_items enable row level security;
drop policy if exists "case_bundle_items_own" on public.case_bundle_items;
create policy "case_bundle_items_own" on public.case_bundle_items for all
using (exists (
  select 1 from public.case_bundles b
  join public.cases c on c.id = b.case_id
  where b.id = bundle_id and c.created_by = auth.uid()
));

-- ========== STORAGE BUCKETS ==========
-- Create via Supabase Dashboard > Storage > New bucket, or:

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('case-documents', 'case-documents', false, 52428800, null),
  ('case-signatures', 'case-signatures', false, 5242880, null),
  ('case-files', 'case-files', false, 104857600, null)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit;

-- ========== STORAGE RLS ==========
-- Path format: userId/caseId/... for case-documents and case-files
-- Path format: userId/caseId/draftId/... for case-signatures

drop policy if exists "case-documents_upload" on storage.objects;
create policy "case-documents_upload" on storage.objects for insert
with check (bucket_id = 'case-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-documents_select" on storage.objects;
create policy "case-documents_select" on storage.objects for select
using (bucket_id = 'case-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-documents_delete" on storage.objects;
create policy "case-documents_delete" on storage.objects for delete
using (bucket_id = 'case-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-signatures_upload" on storage.objects;
create policy "case-signatures_upload" on storage.objects for insert
with check (bucket_id = 'case-signatures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-signatures_select" on storage.objects;
create policy "case-signatures_select" on storage.objects for select
using (bucket_id = 'case-signatures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-signatures_delete" on storage.objects;
create policy "case-signatures_delete" on storage.objects for delete
using (bucket_id = 'case-signatures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-files_upload" on storage.objects;
create policy "case-files_upload" on storage.objects for insert
with check (bucket_id = 'case-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-files_select" on storage.objects;
create policy "case-files_select" on storage.objects for select
using (bucket_id = 'case-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "case-files_delete" on storage.objects;
create policy "case-files_delete" on storage.objects for delete
using (bucket_id = 'case-files' and (storage.foldername(name))[1] = auth.uid()::text);
