-- case_filings: for when FilingRepoStub is swapped for Supabase
-- Run when Supabase is available. Enables persistent filings per case.

create table if not exists public.case_filings (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,

  title text not null,
  court text,
  status text not null default 'draft',

  filed_on timestamptz,
  notes text,

  document_id uuid,
  file_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_filings_case_id_idx on public.case_filings(case_id);

create trigger case_filings_set_updated_at before update on public.case_filings
for each row execute procedure public.set_updated_at();

alter table public.case_filings enable row level security;

drop policy if exists "case_filings_own" on public.case_filings;
create policy "case_filings_own" on public.case_filings for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));
