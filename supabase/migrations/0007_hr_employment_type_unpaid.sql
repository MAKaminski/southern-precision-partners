-- Allow an "unpaid" employment_type on hr_employee_plan_details, for
-- operational-only roles with $0 pay (e.g. a founder covering roles without
-- a paid capacity during the post-transition period).
alter table public.hr_employee_plan_details
  drop constraint hr_employee_plan_details_employment_type_check;

alter table public.hr_employee_plan_details
  add constraint hr_employee_plan_details_employment_type_check
  check (employment_type = any (array['full_time', 'part_time', 'contractor', 'unpaid']));
