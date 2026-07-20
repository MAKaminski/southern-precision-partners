-- ============================================================
-- Southern Precision Partners — monthly investor summary
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- Every other financial table in this schema (forecast_pnl, debt_schedule,
-- revenue_matrix) is annual — there is no monthly-granularity data
-- anywhere in this platform or its source workbook. This table exists so
-- monthly actuals can be tracked against plan as real bookkeeping closes
-- happen; it is seeded with the month/category grid structure only
-- (plan_value and actual_value both null for every row) — NOT with
-- invented monthly splits of the annual forecast/plan totals, which would
-- misrepresent real performance to investors.
-- ============================================================

create table if not exists public.monthly_performance (
  id           uuid primary key default gen_random_uuid(),
  year         integer not null,
  month        integer not null check (month between 1 and 12),
  category     text not null check (category in ('Revenue','EBITDA','Free Cash Flow','Cash Balance')),
  plan_value   numeric(14,2),
  actual_value numeric(14,2),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (year, month, category)
);
create index if not exists monthly_performance_year_month_idx on public.monthly_performance (year, month);
drop trigger if exists monthly_performance_set_updated_at on public.monthly_performance;
create trigger monthly_performance_set_updated_at before update on public.monthly_performance
  for each row execute function public.set_updated_at();

alter table public.monthly_performance enable row level security;

-- Scaffold the 2026 grid (structure only — no values) so the page has
-- something to fill in as each month closes.
insert into public.monthly_performance (year, month, category)
select 2026, m, c
from generate_series(1, 12) as m
cross join (values ('Revenue'), ('EBITDA'), ('Free Cash Flow'), ('Cash Balance')) as cats(c)
on conflict (year, month, category) do nothing;
