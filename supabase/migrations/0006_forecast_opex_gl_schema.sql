-- ============================================================
-- Southern Precision Partners — GL-level OpEx detail
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- forecast_pnl carries OpEx as a single lump category — no GL breakdown
-- exists anywhere in this platform or its source workbook (no Payroll,
-- Rent, Marketing, Insurance, etc. line items). This table adds that
-- planning level without inventing a split of the existing total: every
-- (scenario, year) that has a real OpEx figure gets one "Unclassified"
-- row seeded with that exact total, plus a standard chart-of-accounts of
-- empty (null) category rows ready for real GL data to be entered. As
-- real dollars move from Unclassified into named categories, the row sum
-- should keep reconciling to the original OpEx total — the Forecast page
-- flags it if it doesn't.
-- ============================================================

create table if not exists public.forecast_opex_gl (
  id           uuid primary key default gen_random_uuid(),
  scenario     text not null check (scenario in ('forecast','plan')),
  gl_category  text not null,
  year         integer not null,
  value        numeric(14,2),
  notes        text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (scenario, gl_category, year)
);
create index if not exists forecast_opex_gl_scenario_year_idx on public.forecast_opex_gl (scenario, year);
drop trigger if exists forecast_opex_gl_set_updated_at on public.forecast_opex_gl;
create trigger forecast_opex_gl_set_updated_at before update on public.forecast_opex_gl
  for each row execute function public.set_updated_at();

alter table public.forecast_opex_gl enable row level security;

-- Seed the real, known lump OpEx total under "Unclassified" for every
-- (scenario, year) that already has one in forecast_pnl.
insert into public.forecast_opex_gl (scenario, gl_category, year, value, sort_order)
select scenario, 'Unclassified (Lump OpEx — pending GL breakdown)', year, value, 0
from public.forecast_pnl
where category = 'OpEx'
on conflict (scenario, gl_category, year) do nothing;

-- Scaffold a standard OpEx chart of accounts, empty, for the same
-- (scenario, year) combos — real values to be entered as they're known.
insert into public.forecast_opex_gl (scenario, gl_category, year, value, sort_order)
select f.scenario, cats.name, f.year, null, cats.ord
from (select distinct scenario, year from public.forecast_pnl where category = 'OpEx') f
cross join (values
  ('Payroll & Benefits', 1),
  ('Rent & Occupancy', 2),
  ('Marketing & Advertising', 3),
  ('Insurance', 4),
  ('Utilities', 5),
  ('Professional Fees', 6),
  ('Vehicle & Delivery', 7),
  ('Repairs & Maintenance', 8),
  ('Other G&A', 9)
) as cats(name, ord)
on conflict (scenario, gl_category, year) do nothing;
