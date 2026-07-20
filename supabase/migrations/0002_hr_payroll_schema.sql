-- ============================================================
-- Southern Precision Partners — HR & Payroll schema
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- Two tables: a canonical person roster (`hr_employees`), and a per-plan
-- snapshot of role/status/pay (`hr_employee_plan_details`) so the same
-- person can carry a `current` row and a `post_transition` row side by
-- side — a mechanical person + pay-rate diff between the two plans.
--
-- RLS enabled with NO anon/authenticated policies (deny-by-default), same
-- as every other table in this schema — the app reads/writes exclusively
-- via the service-role client (src/lib/spp-db.ts), gated again by
-- next-auth middleware.
-- ============================================================

-- ---------- hr_employees (canonical roster) ----------
create table if not exists public.hr_employees (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  employee_code text,                 -- external/payroll-system reference, if any
  hire_date     date,
  notes         text,
  source        text not null default 'manual',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists hr_employees_set_updated_at on public.hr_employees;
create trigger hr_employees_set_updated_at before update on public.hr_employees
  for each row execute function public.set_updated_at();

-- ---------- hr_employee_plan_details (per-plan role/status/pay snapshot) ----------
create table if not exists public.hr_employee_plan_details (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references public.hr_employees(id) on delete cascade,
  plan             text not null check (plan in ('current','post_transition')),
  role_title       text,
  department       text,
  employment_type  text check (employment_type in ('full_time','part_time','contractor')),
  status           text not null default 'active'
                   check (status in ('active','terminated','new_hire')),
  pay_type         text not null check (pay_type in ('salary','hourly')),
  pay_rate         numeric(10,2) not null,   -- annual $ if salary, $/hr if hourly
  hours_per_week   numeric(5,2),             -- only meaningful when pay_type = 'hourly'
  annualized_cost  numeric(12,2),            -- salary: = pay_rate; hourly: = pay_rate * hours_per_week * 52
  change_type      text not null default 'unchanged'
                   check (change_type in ('unchanged','pay_increase','pay_decrease','role_change','new_hire','termination')),
  effective_date   date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (employee_id, plan)
);
create index if not exists hr_employee_plan_details_employee_idx on public.hr_employee_plan_details (employee_id);
create index if not exists hr_employee_plan_details_plan_idx on public.hr_employee_plan_details (plan);
create index if not exists hr_employee_plan_details_status_idx on public.hr_employee_plan_details (status);
drop trigger if exists hr_employee_plan_details_set_updated_at on public.hr_employee_plan_details;
create trigger hr_employee_plan_details_set_updated_at before update on public.hr_employee_plan_details
  for each row execute function public.set_updated_at();

-- ---------- RLS (deny-by-default; service_role bypasses) ----------
alter table public.hr_employees             enable row level security;
alter table public.hr_employee_plan_details enable row level security;
