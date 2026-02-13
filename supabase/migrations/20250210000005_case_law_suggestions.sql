-- case_law_suggestions: for ProactiveCaseLaw persistence
-- Run when Supabase is available. Enables persisted AI-suggested case law per case.

create table if not exists public.case_law_suggestions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,

  citation text not null,
  holding text,
  relevance text,
  strength text,

  pinned boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists case_law_suggestions_case_id_idx on public.case_law_suggestions(case_id);

alter table public.case_law_suggestions enable row level security;

drop policy if exists "case_law_suggestions_own" on public.case_law_suggestions;
create policy "case_law_suggestions_own" on public.case_law_suggestions for all
using (exists (select 1 from public.cases c where c.id = case_id and c.created_by = auth.uid()));
