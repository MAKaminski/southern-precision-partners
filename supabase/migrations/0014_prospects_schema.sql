-- ============================================================
-- Southern Precision Partners — prospect pipeline schema
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Additive and non-breaking: creates two new
-- tables and touches nothing existing.
--
-- Holds the SC-expansion Pro prospect list sourced from the "Landbase —
-- Atlanta roof replacement pros" export (uploaded 2026-07-22). The data is
-- genuinely two-level — construction/remodeling COMPANIES and the named
-- decision-maker CONTACTS at them — so it is modelled as two tables rather
-- than flattened into the existing `contacts` outreach table (which has no
-- company record and no employees/LinkedIn/street fields).
--
-- prospect_companies.matched_customer_id is a NON-DESTRUCTIVE link to an
-- existing customer where the prospect appears to already be an account. It
-- is populated by 0015 and never writes back to `customers` — the enrichment
-- is surfaced as a reviewable candidate, not auto-applied, because customer
-- names in this dataset are truncated (~14 chars) and match on prefix.
--
-- RLS: enabled with no policies (deny-by-default), same as every other table
-- here; the service-role client (getSppDb) bypasses it. updated_at is kept by
-- the shared public.set_updated_at() trigger.
-- ============================================================

-- ---------- prospect_companies ----------
create table if not exists public.prospect_companies (
  id                   uuid primary key default gen_random_uuid(),
  company_key          text not null unique,        -- normalized name, natural key
  name                 text not null,
  website              text,
  industry             text,
  street               text,
  city                 text,
  state                text,
  zip                  text,
  region               text,                         -- SC-expansion territory (Columbia/Florence/…)
  employees            integer,
  revenue              numeric(14,0),
  revenue_range        text,
  size_range           text,
  description          text,
  keywords             text,
  email                text,                         -- company-level enriched email (sparse)
  phone                text,
  fit_score            integer not null default 0,   -- 0–100 heuristic priority
  fit_evidence         text,
  matched_customer_id  uuid references public.customers(id) on delete set null,
  match_confidence     text,                          -- 'strong' | 'possible' | null
  data_source          text not null default 'landbase_sc_roofing_2026_07',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists prospect_companies_fit_idx    on public.prospect_companies (fit_score desc);
create index if not exists prospect_companies_region_idx on public.prospect_companies (region);
create index if not exists prospect_companies_match_idx  on public.prospect_companies (matched_customer_id);

drop trigger if exists prospect_companies_set_updated_at on public.prospect_companies;
create trigger prospect_companies_set_updated_at
  before update on public.prospect_companies
  for each row execute function public.set_updated_at();

alter table public.prospect_companies enable row level security;

-- ---------- prospect_contacts ----------
create table if not exists public.prospect_contacts (
  id                uuid primary key default gen_random_uuid(),
  contact_key       text not null unique,            -- normalized company+linkedin/name, natural key
  company_key       text not null references public.prospect_companies (company_key) on delete cascade,
  first_name        text,
  last_name         text,
  title             text,
  linkedin_url      text,
  department        text,
  management_level  text,
  skills            text,
  data_source       text not null default 'landbase_sc_roofing_2026_07',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists prospect_contacts_company_idx on public.prospect_contacts (company_key);

drop trigger if exists prospect_contacts_set_updated_at on public.prospect_contacts;
create trigger prospect_contacts_set_updated_at
  before update on public.prospect_contacts
  for each row execute function public.set_updated_at();

alter table public.prospect_contacts enable row level security;
