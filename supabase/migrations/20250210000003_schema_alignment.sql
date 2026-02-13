-- Schema alignment: add columns expected by exhibits API, bundles API, and worker
-- Run after 20250210000002_full_schema.sql

-- case_exhibits: API expects exhibit_no, label, sort_order, proof_notes, source, file_path, url, created_by, code
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='exhibit_no') then
    alter table public.case_exhibits add column exhibit_no integer;
    update public.case_exhibits set exhibit_no = exhibit_index where exhibit_index is not null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='label') then
    alter table public.case_exhibits add column label text;
    update public.case_exhibits set label = exhibit_label where exhibit_label is not null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='sort_order') then
    alter table public.case_exhibits add column sort_order integer not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='proof_notes') then
    alter table public.case_exhibits add column proof_notes text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='source') then
    alter table public.case_exhibits add column source text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='file_path') then
    alter table public.case_exhibits add column file_path text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='url') then
    alter table public.case_exhibits add column url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='created_by') then
    alter table public.case_exhibits add column created_by uuid references auth.users(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='code') then
    alter table public.case_exhibits add column code text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_exhibits' and column_name='updated_at') then
    alter table public.case_exhibits add column updated_at timestamptz not null default now();
    create trigger case_exhibits_set_updated_at before update on public.case_exhibits
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- case_parties: parties API inserts created_by
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_parties' and column_name='created_by') then
    alter table public.case_parties add column created_by uuid references auth.users(id) on delete set null;
  end if;
end $$;

-- case_bundles: bundles API expects kind, include_bates, bates_prefix, bates_start
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_bundles' and column_name='kind') then
    alter table public.case_bundles add column kind text not null default 'exhibits';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_bundles' and column_name='include_bates') then
    alter table public.case_bundles add column include_bates boolean not null default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_bundles' and column_name='bates_prefix') then
    alter table public.case_bundles add column bates_prefix text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='case_bundles' and column_name='bates_start') then
    alter table public.case_bundles add column bates_start integer;
  end if;
end $$;
