-- Customer contact info + store affiliation. None of this exists in the
-- source AR/summary workbook (verified: no email/phone/address/store
-- column anywhere in the 2024-2026 AR tabs, SUMMARY tabs, or elsewhere) —
-- these start null and are filled in manually via the CRM UI as real
-- contact data becomes available. primary_store is free text (not a CHECK
-- constraint) since the only two locations known today (Columbia,
-- Florence — from the HISTORICAL sheet and hr_employees departments)
-- aren't guaranteed to be the only ones going forward.
alter table public.customers
  add column email text,
  add column phone text,
  add column address_line1 text,
  add column city text,
  add column state text,
  add column zip text,
  add column primary_store text;
