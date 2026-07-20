-- ============================================================
-- Southern Precision Partners — Platform operational schema
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- All tables RLS-enabled with NO anon/authenticated policies (deny-by-default).
-- The app reads/writes exclusively via the service-role client
-- (src/lib/spp-db.ts), gated again by next-auth middleware.
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- customers (master) ----------
create table if not exists public.customers (
  id                       uuid primary key default gen_random_uuid(),
  customer_code            text,                          -- AR account code; NOT unique (reused across customers, e.g. CASH01)
  name                     text not null,
  name_key                 text not null unique,          -- normalized business key (join key across tabs)
  alias                    text,
  first_sale_date          date,
  last_sale_date           date,
  lifetime_sales           numeric(14,2) not null default 0,
  lifetime_sale_count      integer       not null default 0,
  lifetime_payments        numeric(14,2) not null default 0,
  lifetime_payment_count   integer       not null default 0,
  balance                  numeric(14,2) not null default 0,
  segment                  text,
  notes                    text,
  source                   text not null default 'mosaic_xlsx',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists customers_customer_code_idx on public.customers (customer_code);
drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------- customer_annual_sales (SUMMARY 24/25/26) ----------
create table if not exists public.customer_annual_sales (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  year         integer not null,
  sales        numeric(14,2) not null default 0,
  created_at   timestamptz not null default now(),
  unique (customer_id, year)
);
create index if not exists customer_annual_sales_year_idx on public.customer_annual_sales (year);

-- ---------- ar_transactions (AR ledger) ----------
create table if not exists public.ar_transactions (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references public.customers(id) on delete set null,
  year            integer not null,
  invoice_date    date,
  invoice_number  text,
  invoice_amount  numeric(14,2),
  payment_ref     text,
  payment_date    date,
  payment_amount  numeric(14,2),
  running_balance numeric(14,2),
  is_credit_memo  boolean not null default false,
  line_key        text not null unique,
  raw             jsonb,
  created_at      timestamptz not null default now()
);
create index if not exists ar_transactions_customer_idx on public.ar_transactions (customer_id);
create index if not exists ar_transactions_year_idx on public.ar_transactions (year);
create index if not exists ar_transactions_invoice_date_idx on public.ar_transactions (invoice_date);

-- ---------- delivery_tasks (Delivery Plan) — editable ----------
create table if not exists public.delivery_tasks (
  id             uuid primary key default gen_random_uuid(),
  delivery_year  integer,
  item           numeric,
  task           numeric,
  system         text,
  rank           numeric,
  title          text not null,
  next_step      text,
  owner          text,
  start_date     date,
  end_date       date,
  cost_k         numeric(10,2),
  benefit_k      numeric(10,2),
  status         text not null default 'not_started'
                 check (status in ('not_started','in_progress','blocked','done')),
  notes          text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
drop trigger if exists delivery_tasks_set_updated_at on public.delivery_tasks;
create trigger delivery_tasks_set_updated_at before update on public.delivery_tasks
  for each row execute function public.set_updated_at();

-- ---------- forecast_pnl (Forecast + Plan grids) — editable ----------
create table if not exists public.forecast_pnl (
  id          uuid primary key default gen_random_uuid(),
  scenario    text not null check (scenario in ('forecast','plan')),
  category    text not null,
  year        integer not null,
  value       numeric(16,4),
  is_percent  boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (scenario, category, year)
);
drop trigger if exists forecast_pnl_set_updated_at on public.forecast_pnl;
create trigger forecast_pnl_set_updated_at before update on public.forecast_pnl
  for each row execute function public.set_updated_at();

-- ---------- debt_schedule — editable ----------
create table if not exists public.debt_schedule (
  id             uuid primary key default gen_random_uuid(),
  facility       text not null,
  year           integer not null,
  principal      numeric(14,2),
  interest       numeric(14,2),
  ending_balance numeric(14,2),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (facility, year)
);
drop trigger if exists debt_schedule_set_updated_at on public.debt_schedule;
create trigger debt_schedule_set_updated_at before update on public.debt_schedule
  for each row execute function public.set_updated_at();

-- ---------- revenue_matrix — editable ----------
create table if not exists public.revenue_matrix (
  id           uuid primary key default gen_random_uuid(),
  year         integer not null unique,
  existing_rev numeric(14,2),
  new_rev      numeric(14,2),
  replacement  numeric(14,2),
  churn        numeric(14,2),
  ending_rev   numeric(14,2),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists revenue_matrix_set_updated_at on public.revenue_matrix;
create trigger revenue_matrix_set_updated_at before update on public.revenue_matrix
  for each row execute function public.set_updated_at();

-- ---------- contacts (outreach; recreated from DBContact) ----------
create table if not exists public.contacts (
  id                       uuid primary key default gen_random_uuid(),
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
  estimated_annual_revenue text,
  estimated_tile_spend     text,
  products_of_interest     text[],
  outreach_priority        integer default 2,
  outreach_status          text default 'ready',
  outreach_channel         text default 'Email + Phone',
  email_template           text,
  last_contacted_at        timestamptz,
  notes                    text,
  tags                     text[] default '{}',
  data_source              text default 'manual',
  created_at               timestamptz not null default now()
);
create index if not exists contacts_outreach_status_idx on public.contacts (outreach_status);
create index if not exists contacts_state_idx on public.contacts (state);

-- ---------- RLS (deny-by-default; service_role bypasses) ----------
alter table public.customers             enable row level security;
alter table public.customer_annual_sales enable row level security;
alter table public.ar_transactions       enable row level security;
alter table public.delivery_tasks        enable row level security;
alter table public.forecast_pnl          enable row level security;
alter table public.debt_schedule         enable row level security;
alter table public.revenue_matrix        enable row level security;
alter table public.contacts              enable row level security;
