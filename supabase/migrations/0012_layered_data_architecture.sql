-- ============================================================
-- Southern Precision Partners — layered data architecture (scaffold)
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). See docs/DATA_ARCHITECTURE.md for the full design.
--
-- Pipeline:  raw -> staging -> core (proper ERD) -> analytics + serving
--
-- This migration is ADDITIVE and NON-BREAKING. It creates the new schemas and
-- the target `core` model EMPTY (ready for ETL), stands up `analytics.figure`
-- + its refresh function, and creates `serving.*` views that read from TODAY's
-- `public` tables — so the app can move onto the stable serving contract with
-- zero data movement. Nothing in `public` is altered or dropped here.
--
-- Cutover (later migrations): backfill core from public via staging (0013),
-- repoint the serving views at core/analytics (0014), retire public (0015).
-- ============================================================

create schema if not exists raw;
create schema if not exists staging;
create schema if not exists core;
create schema if not exists analytics;
create schema if not exists serving;

comment on schema raw       is 'Files at ingestion, exactly as received. Immutable, append-only, all-text.';
comment on schema staging   is 'Normalization + cleaning. Typed/validated/deduped. Fully rebuildable from raw.';
comment on schema core      is 'Proper ERD — normalized source of truth. One entity, one table, one PK.';
comment on schema analytics is 'Pre-calculated figures (analytics.figure) — fast single-lookup recall.';
comment on schema serving   is 'Front-end mapping layer: stable read-only view contract the app queries.';

-- ---------------------------------------------------------------
-- 1) raw — ingestion registry (per-sheet landing tables are created by the
--    loader on ingest; only the registry is defined here).
-- ---------------------------------------------------------------
create table if not exists raw.ingestion (
  ingestion_id  uuid primary key default gen_random_uuid(),
  source_file   text not null,
  sheet         text,
  loaded_at     timestamptz not null default now(),
  row_count     integer,
  sha256        text,
  loaded_by     text
);

-- ---------------------------------------------------------------
-- 2) core — Proper ERD. Empty; loaded from staging during cutover.
--    No PK duplication: every entity keyed once; facts reference dims by FK.
-- ---------------------------------------------------------------

-- Dimensions ----------------------------------------------------
create table if not exists core.dim_period (
  period_id  uuid primary key default gen_random_uuid(),
  year       integer not null,
  month      integer check (month between 1 and 12),   -- NULL = annual
  quarter    integer check (quarter between 1 and 4),
  label      text
);
create unique index if not exists dim_period_year_month_uk
  on core.dim_period (year, coalesce(month, 0));

create table if not exists core.dim_segment (
  segment_code text primary key,          -- b2b_tier1, individual_repeat, ...
  label        text not null,
  description  text
);

create table if not exists core.dim_customer (
  customer_id      uuid primary key default gen_random_uuid(),
  name_key         text not null unique,  -- normalized business/join key
  name             text not null,
  alias            text,
  customer_code    text,                  -- AR account code; NOT unique (e.g. CASH01)
  segment_code     text references core.dim_segment(segment_code),
  first_sale_date  date,
  last_sale_date   date,
  source           text not null default 'mosaic_xlsx',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists core.dim_employee (
  employee_id    uuid primary key default gen_random_uuid(),
  full_name      text not null,
  employee_code  text,
  hire_date      date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists core.dim_scenario (
  scenario_code text primary key,         -- plan | forecast | actual
  label         text not null
);

create table if not exists core.dim_metric (
  metric_code       text primary key,     -- revenue, cogs, gm, opex, ebitda, fcf, cash_balance
  label             text not null,
  unit              text not null default 'usd',
  is_percent        boolean not null default false,
  statement_section text,
  sort_order        integer not null default 0
);

create table if not exists core.dim_gl_account (
  gl_account_id uuid primary key default gen_random_uuid(),
  code          text,
  name          text not null,
  metric_code   text references core.dim_metric(metric_code),  -- optional rollup
  sort_order    integer not null default 0,
  unique (name)
);

create table if not exists core.dim_debt_facility (
  facility_id uuid primary key default gen_random_uuid(),
  name        text not null unique,
  type        text
);

create table if not exists core.dim_contact (
  contact_id               uuid primary key default gen_random_uuid(),
  company                  text not null,
  company_type             text,
  license_number           text,
  city                     text,
  state                    text,
  county                   text,
  region                   text,
  contact_name             text,
  contact_title            text,
  email                    text,
  phone                    text,
  website                  text,
  buyer_intent_score       integer default 0,
  outreach_priority        integer default 2,
  outreach_status          text default 'ready',
  outreach_channel         text default 'Email + Phone',
  data_source              text default 'manual',
  notes                    text,
  tags                     text[] default '{}',
  last_contacted_at        timestamptz,
  created_at               timestamptz not null default now()
);

-- Facts (grain enforced by PK; dims referenced by FK, never copied) ----------
create table if not exists core.fact_customer_sales (
  customer_id uuid not null references core.dim_customer(customer_id) on delete cascade,
  period_id   uuid not null references core.dim_period(period_id),
  sales       numeric(14,2) not null default 0,
  primary key (customer_id, period_id)
);

create table if not exists core.fact_ar_entry (
  entry_id        uuid primary key default gen_random_uuid(),
  line_key        text not null unique,
  customer_id     uuid references core.dim_customer(customer_id) on delete set null,
  period_id       uuid references core.dim_period(period_id),
  invoice_date    date,
  invoice_number  text,
  invoice_amount  numeric(14,2),
  payment_ref     text,
  payment_date    date,
  payment_amount  numeric(14,2),
  running_balance numeric(14,2),
  is_credit_memo  boolean not null default false
);

create table if not exists core.fact_pnl (
  scenario_code text not null references core.dim_scenario(scenario_code),
  metric_code   text not null references core.dim_metric(metric_code),
  period_id     uuid not null references core.dim_period(period_id),
  value         numeric(16,4),
  primary key (scenario_code, metric_code, period_id)
);

create table if not exists core.fact_opex_gl (
  scenario_code text not null references core.dim_scenario(scenario_code),
  gl_account_id uuid not null references core.dim_gl_account(gl_account_id),
  period_id     uuid not null references core.dim_period(period_id),
  value         numeric(14,2),
  primary key (scenario_code, gl_account_id, period_id)
);

create table if not exists core.fact_debt_schedule (
  facility_id    uuid not null references core.dim_debt_facility(facility_id),
  period_id      uuid not null references core.dim_period(period_id),
  principal      numeric(14,2),
  interest       numeric(14,2),
  ending_balance numeric(14,2),
  primary key (facility_id, period_id)
);

create table if not exists core.fact_revenue_matrix (
  period_id    uuid primary key references core.dim_period(period_id),
  existing_rev numeric(14,2),
  new_rev      numeric(14,2),
  replacement  numeric(14,2),
  churn        numeric(14,2),
  ending_rev   numeric(14,2)
);

create table if not exists core.fact_performance (
  metric_code  text not null references core.dim_metric(metric_code),
  period_id    uuid not null references core.dim_period(period_id),
  plan_value   numeric(14,2),
  actual_value numeric(14,2),
  primary key (metric_code, period_id)
);

-- Operational entities (workflow — not analytics facts) ----------------------
create table if not exists core.employee_plan (
  plan_id          uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references core.dim_employee(employee_id) on delete cascade,
  plan_scenario    text not null check (plan_scenario in ('current','post_transition')),
  role_title       text,
  department       text,
  employment_type  text check (employment_type in ('full_time','part_time','contractor','unpaid')),
  status           text not null default 'active' check (status in ('active','terminated','new_hire')),
  pay_type         text not null check (pay_type in ('salary','hourly')),
  pay_rate         numeric(10,2) not null,
  hours_per_week   numeric(5,2),
  change_type      text not null default 'unchanged'
                   check (change_type in ('unchanged','pay_increase','pay_decrease','role_change','new_hire','termination')),
  effective_date   date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (employee_id, plan_scenario)
);

create table if not exists core.growth_initiative (
  initiative_id         uuid primary key default gen_random_uuid(),
  category              text not null check (category in ('new_business','churn_replacement','share_of_wallet','pricing','other')),
  name                  text not null unique,
  description           text,
  target_revenue_impact numeric(14,2),
  owner                 text,
  status                text not null default 'tbd' check (status in ('tbd','planned','in_progress','done')),
  notes                 text,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists core.delivery_task (
  task_id        uuid primary key default gen_random_uuid(),
  delivery_year  integer,
  system         text,
  title          text not null,
  next_step      text,
  owner          text,
  start_date     date,
  end_date       date,
  cost_k         numeric(10,2),
  benefit_k      numeric(10,2),
  status         text not null default 'not_started' check (status in ('not_started','in_progress','blocked','done')),
  notes          text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Seed the small, stable lookup dimensions (idempotent) ----------------------
insert into core.dim_scenario (scenario_code, label) values
  ('plan','Plan'), ('forecast','Forecast'), ('actual','Actual')
on conflict (scenario_code) do nothing;

insert into core.dim_segment (segment_code, label) values
  ('b2b_tier1','B2B Tier 1 — Key Accounts'),
  ('b2b_tier2','B2B Tier 2 — Core Accounts'),
  ('b2b_tier3','B2B Tier 3 — Growth Accounts'),
  ('individual_repeat','Individual — Repeat Buyer'),
  ('individual_single','Individual — One-Off Buyer')
on conflict (segment_code) do nothing;

insert into core.dim_metric (metric_code, label, unit, is_percent, statement_section, sort_order) values
  ('revenue','Revenue','usd',false,'income',10),
  ('cogs','COGS','usd',false,'income',20),
  ('gm','Gross Margin','usd',false,'income',30),
  ('opex','Operating Expense','usd',false,'income',40),
  ('ebitda','EBITDA','usd',false,'income',50),
  ('fcf','Free Cash Flow','usd',false,'cashflow',60),
  ('cash_balance','Cash Balance','usd',false,'balance',70)
on conflict (metric_code) do nothing;

-- Annual period spine 2022-2031 + monthly spine 2026-2031 (idempotent) -------
insert into core.dim_period (year, month, quarter, label)
select y, null, null, y::text
from generate_series(2022, 2031) as y
on conflict do nothing;

insert into core.dim_period (year, month, quarter, label)
select y, m, ((m - 1) / 3) + 1, to_char(make_date(y, m, 1), 'Mon YYYY')
from generate_series(2026, 2031) as y
cross join generate_series(1, 12) as m
on conflict do nothing;

-- ---------------------------------------------------------------
-- 3) analytics.figure — one flat pre-calc table for fast recall.
-- ---------------------------------------------------------------
create table if not exists analytics.figure (
  figure_id     uuid primary key default gen_random_uuid(),
  scope         text not null,                -- 'company' | 'customer' | 'employee' | 'deal'
  entity_key    text,                         -- name_key / employee_id / NULL for company-wide
  metric_code   text not null,
  scenario_code text,
  year          integer,                      -- NULL = all-time
  month         integer,                      -- NULL = annual / point-in-time
  value         numeric(18,4),
  unit          text not null default 'usd',
  computed_at   timestamptz not null default now(),
  unique (scope, entity_key, metric_code, scenario_code, year, month)
);
create index if not exists figure_lookup_idx
  on analytics.figure (scope, metric_code, year);

-- Recompute the pre-calc table. During scaffolding it reads from `public`;
-- migration 0014 repoints the body at `core.*` once the ETL backfill lands.
create or replace function analytics.refresh_figures()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from analytics.figure;

  -- Company P&L figures (plan + forecast) by year, from the current model.
  insert into analytics.figure (scope, entity_key, metric_code, scenario_code, year, month, value, unit)
  select 'company', null, lower(replace(category, ' ', '_')), scenario, year, null, value,
         case when is_percent then 'pct' else 'usd' end
  from public.forecast_pnl
  on conflict do nothing;

  -- Per-customer lifetime aggregates (all-time).
  insert into analytics.figure (scope, entity_key, metric_code, scenario_code, year, month, value, unit)
  select 'customer', name_key, 'lifetime_sales', 'actual', null, null, lifetime_sales, 'usd'
  from public.customers
  on conflict do nothing;

  insert into analytics.figure (scope, entity_key, metric_code, scenario_code, year, month, value, unit)
  select 'customer', name_key, 'balance', 'actual', null, null, balance, 'usd'
  from public.customers
  on conflict do nothing;

  -- Per-employee annualized cost, current + post-transition plans.
  insert into analytics.figure (scope, entity_key, metric_code, scenario_code, year, month, value, unit)
  select 'employee', d.employee_id::text || ':' || d.plan, 'annualized_cost', 'plan', null, null,
         d.annualized_cost, 'usd'
  from public.hr_employee_plan_details d
  where d.annualized_cost is not null
  on conflict do nothing;
end;
$$;

-- ---------------------------------------------------------------
-- 4) serving.* — stable read-only contract for the app.
--    Scaffolding: read from today's `public`. Repointed to core in 0014.
-- ---------------------------------------------------------------
create or replace view serving.customer_summary as
  select id as customer_id, name, name_key, alias, segment, customer_code,
         first_sale_date, last_sale_date, lifetime_sales, lifetime_sale_count,
         lifetime_payments, lifetime_payment_count, balance
  from public.customers;

create or replace view serving.monthly_summary as
  select id, year, month, category, plan_value, actual_value, notes
  from public.monthly_performance;

create or replace view serving.hr_roster as
  select e.id as employee_id, e.full_name, e.employee_code, e.hire_date,
         d.plan, d.role_title, d.department, d.employment_type, d.status,
         d.pay_type, d.pay_rate, d.hours_per_week, d.annualized_cost, d.change_type
  from public.hr_employees e
  left join public.hr_employee_plan_details d on d.employee_id = e.id;

create or replace view serving.delivery_plan as
  select id, delivery_year, system, title, next_step, owner, start_date, end_date,
         cost_k, benefit_k, status, sort_order
  from public.delivery_tasks;

create or replace view serving.forecast_pnl as
  select scenario, category, year, value, is_percent, sort_order
  from public.forecast_pnl;

create or replace view serving.opex_gl as
  select scenario, gl_category, year, value, sort_order
  from public.forecast_opex_gl;

create or replace view serving.debt_schedule as
  select facility, year, principal, interest, ending_balance
  from public.debt_schedule;

create or replace view serving.revenue_matrix as
  select year, existing_rev, new_rev, replacement, churn, ending_rev
  from public.revenue_matrix;

create or replace view serving.company_kpi as
  select scope, metric_code, scenario_code, year, value, unit
  from analytics.figure
  where scope = 'company';

-- ---------------------------------------------------------------
-- 5) Security posture — match the deny-by-default RLS used elsewhere.
--    Service-role (getSppDb) bypasses RLS; the app has no anon path to these.
-- ---------------------------------------------------------------
alter table raw.ingestion              enable row level security;
alter table core.dim_period            enable row level security;
alter table core.dim_segment           enable row level security;
alter table core.dim_customer          enable row level security;
alter table core.dim_employee          enable row level security;
alter table core.dim_scenario          enable row level security;
alter table core.dim_metric            enable row level security;
alter table core.dim_gl_account        enable row level security;
alter table core.dim_debt_facility     enable row level security;
alter table core.dim_contact           enable row level security;
alter table core.fact_customer_sales   enable row level security;
alter table core.fact_ar_entry         enable row level security;
alter table core.fact_pnl              enable row level security;
alter table core.fact_opex_gl          enable row level security;
alter table core.fact_debt_schedule    enable row level security;
alter table core.fact_revenue_matrix   enable row level security;
alter table core.fact_performance      enable row level security;
alter table core.employee_plan         enable row level security;
alter table core.growth_initiative     enable row level security;
alter table core.delivery_task         enable row level security;
alter table analytics.figure           enable row level security;
