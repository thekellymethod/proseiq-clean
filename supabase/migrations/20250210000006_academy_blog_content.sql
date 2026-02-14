-- Academy and Blog content tables for admin-managed CMS
-- No RLS on these; admin API uses service role or secret token

-- Academy tiers (e.g. Tier I, Tier II)
create table if not exists public.academy_tiers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  pricing text,
  includes jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_tiers_slug_idx on public.academy_tiers(slug);

-- Academy modules (belong to a tier)
create table if not exists public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.academy_tiers(id) on delete cascade,
  slug text not null,
  title text not null,
  outcome text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tier_id, slug)
);

create index if not exists academy_modules_tier_idx on public.academy_modules(tier_id);

-- Academy module content (lessons, checklists, media - one row per module or multiple for sections)
create table if not exists public.academy_module_content (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  kind text not null default 'lesson',
  title text,
  content text,
  content_rich jsonb,
  media jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_module_content_module_idx on public.academy_module_content(module_id);

-- Blog pillars (categories)
create table if not exists public.blog_pillars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  topics jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_pillars_slug_idx on public.blog_pillars(slug);

-- Blog articles
create table if not exists public.blog_articles (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid not null references public.blog_pillars(id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text,
  content text,
  content_rich jsonb,
  media jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pillar_id, slug)
);

create index if not exists blog_articles_pillar_idx on public.blog_articles(pillar_id);
create index if not exists blog_articles_published_idx on public.blog_articles(published_at) where published_at is not null;

-- Triggers for updated_at
create trigger academy_tiers_set_updated_at before update on public.academy_tiers
for each row execute procedure public.set_updated_at();
create trigger academy_modules_set_updated_at before update on public.academy_modules
for each row execute procedure public.set_updated_at();
create trigger academy_module_content_set_updated_at before update on public.academy_module_content
for each row execute procedure public.set_updated_at();
create trigger blog_pillars_set_updated_at before update on public.blog_pillars
for each row execute procedure public.set_updated_at();
create trigger blog_articles_set_updated_at before update on public.blog_articles
for each row execute procedure public.set_updated_at();

-- RLS: allow public read for Academy and Blog content; admin uses service role for writes
alter table public.academy_tiers enable row level security;
alter table public.academy_modules enable row level security;
alter table public.academy_module_content enable row level security;
alter table public.blog_pillars enable row level security;
alter table public.blog_articles enable row level security;

create policy "academy_tiers_public_read" on public.academy_tiers for select using (true);
create policy "academy_modules_public_read" on public.academy_modules for select using (true);
create policy "academy_module_content_public_read" on public.academy_module_content for select using (true);
create policy "blog_pillars_public_read" on public.blog_pillars for select using (true);
create policy "blog_articles_public_read" on public.blog_articles for select using (true);

-- Seed initial Academy and Blog content from hardcoded structure
insert into public.academy_tiers (slug, title, tagline, pricing, includes, sort_order) values
  ('tier-1', 'Tier I — Foundational Literacy', 'For beginners. Completion results in a Foundational Certificate.', 'Free or low cost', '["10–20 min structured lesson","Downloadable checklist","Structured template","Practice scenario","Self-assessment quiz"]'::jsonb, 0),
  ('tier-2', 'Tier II — Tactical Competence', 'From literacy to performance.', 'Subscription', '["Motion drafting labs","Redline examples (bad vs good)","Devil''s Advocate exercises"]'::jsonb, 1),
  ('tier-3', 'Tier III — Strategic Litigation', 'Advanced. Differentiate from random legal advice.', 'Premium', '["Strategic frameworks","Outcome-based modules"]'::jsonb, 2)
on conflict (slug) do nothing;

insert into public.academy_modules (tier_id, slug, title, outcome, sort_order)
select t.id, m.slug, m.title, m.outcome, m.ord
from (values
  ('tier-1', 'understanding-court-structure', 'Understanding Court Structure', null, 0),
  ('tier-1', 'civil-procedure-basics', 'Civil Procedure Basics', null, 1),
  ('tier-1', 'drafting-a-complaint', 'Drafting a Complaint', 'By the end, you will draft a procedurally compliant complaint.', 2),
  ('tier-1', 'responding-to-a-complaint', 'Responding to a Complaint', 'By the end, you will draft a procedurally compliant response.', 3),
  ('tier-1', 'deadlines-service', 'Deadlines & Service', null, 4),
  ('tier-2', 'motion-practice-architecture', 'Motion Practice Architecture', 'By the end, you will draft a procedurally compliant motion.', 0),
  ('tier-2', 'evidence-framing', 'Evidence Framing', null, 1),
  ('tier-2', 'affidavits-declarations', 'Affidavits & Declarations', null, 2),
  ('tier-2', 'discovery-strategy', 'Discovery Strategy', null, 3),
  ('tier-2', 'preserving-error', 'Preserving Error', null, 4),
  ('tier-3', 'case-mapping-timeline', 'Case Mapping & Timeline Construction', null, 0),
  ('tier-3', 'risk-analysis', 'Risk Analysis', null, 1),
  ('tier-3', 'settlement-leverage', 'Settlement Leverage', null, 2),
  ('tier-3', 'trial-preparation', 'Trial Preparation Fundamentals', null, 3),
  ('tier-3', 'appellate-awareness', 'Appellate Awareness', null, 4)
) as m(tier_slug, slug, title, outcome, ord)
join public.academy_tiers t on t.slug = m.tier_slug
on conflict (tier_id, slug) do nothing;

insert into public.blog_pillars (slug, title, tagline, topics, sort_order) values
  ('procedural-foundations', 'Pillar I — Procedural Foundations', 'Analytical, educational, slightly elevated.', '["Why cases fail before they are heard","The anatomy of a motion to dismiss","The psychology of judicial decision-making","Understanding jurisdiction before argument"]'::jsonb, 0),
  ('strategic-positioning', 'Pillar II — Strategic Positioning', 'Strategist, not tutor.', '["Framing issues for maximum leverage","Drafting with asymmetry in mind","Offensive vs defensive litigation thinking","How to evaluate settlement leverage"]'::jsonb, 1),
  ('legal-literacy-access', 'Pillar III — Legal Literacy & Access', 'Philosophical credibility.', '["The justice gap","Structural inequities in procedure","Technology in legal empowerment","AI''s proper role in law"]'::jsonb, 2),
  ('case-dissections', 'Pillar IV — Case Dissections', 'Applied intelligence. Anonymous hypothetical case breakdowns.', '["A failed complaint and why","A well-structured response and why it works","Tactical mistakes in evidence submission"]'::jsonb, 3)
on conflict (slug) do nothing;
