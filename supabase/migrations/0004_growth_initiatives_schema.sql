-- ============================================================
-- Southern Precision Partners — Marketing & Growth initiatives
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- Tracks the "New business" vs "Churn replacement" growth levers the
-- revenue_matrix table already measures in aggregate (existing_rev /
-- new_rev / replacement / churn / ending_rev) — this table is where the
-- *strategy* behind those numbers gets defined, one initiative at a time,
-- as the marketing & growth lead scopes it out. Seeded with the categories
-- already named as candidates (share-of-wallet growth, pricing
-- adjustments, new customer acquisition) — status 'tbd' for all of them
-- until that scoping happens, no invented targets or plans.
-- ============================================================

create table if not exists public.growth_initiatives (
  id                     uuid primary key default gen_random_uuid(),
  category               text not null
                         check (category in ('new_business','churn_replacement','share_of_wallet','pricing','other')),
  name                   text not null unique,
  description            text,
  target_revenue_impact  numeric(14,2),
  owner                  text,
  status                 text not null default 'tbd'
                         check (status in ('tbd','planned','in_progress','done')),
  notes                  text,
  sort_order             integer not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists growth_initiatives_category_idx on public.growth_initiatives (category);
create index if not exists growth_initiatives_status_idx on public.growth_initiatives (status);
drop trigger if exists growth_initiatives_set_updated_at on public.growth_initiatives;
create trigger growth_initiatives_set_updated_at before update on public.growth_initiatives
  for each row execute function public.set_updated_at();

alter table public.growth_initiatives enable row level security;

insert into public.growth_initiatives (category, name, description, status, sort_order) values
  ('new_business', 'New Customer Acquisition', 'Primary lever behind revenue_matrix''s new_rev. Strategy TBD — pending scoping with the marketing & growth lead.', 'tbd', 1),
  ('share_of_wallet', 'Existing Customer Share-of-Wallet Growth', 'Candidate churn-replacement lever: grow spend within the existing customer base. TBD with the marketing & growth lead.', 'tbd', 2),
  ('pricing', 'Pricing Adjustments', 'Candidate churn-replacement lever: price changes on existing product/service lines. TBD with the marketing & growth lead.', 'tbd', 3),
  ('churn_replacement', 'New Customer Acquisition (Churn Replacement)', 'Candidate churn-replacement lever, distinct from net-new growth above — acquiring customers specifically to offset churn. TBD with the marketing & growth lead.', 'tbd', 4)
on conflict (name) do nothing;
