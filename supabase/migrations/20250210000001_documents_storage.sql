-- Documents table for ProseIQ (if schema uses "documents" not "case_documents")
-- Run in Supabase SQL editor. Storage bucket "case-documents" must exist (create via Dashboard).

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  storage_bucket text not null default 'case-documents',
  storage_path text not null,
  kind text not null default 'general',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_case_id_idx on public.documents(case_id);
create index if not exists documents_created_by_idx on public.documents(created_by);

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents for select using (auth.uid() = created_by);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents for insert with check (auth.uid() = created_by);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents for update using (auth.uid() = created_by);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents for delete using (auth.uid() = created_by);
