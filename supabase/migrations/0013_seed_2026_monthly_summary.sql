-- ============================================================
-- Southern Precision Partners — 2026 monthly Summary figures
-- Applied to the dedicated Supabase project `southern-precision-partners`
-- (ref yscxrvuwwfpjuciuawcv). Committed here for reproducibility.
--
-- The source workbook (Mosaic.xlsx) has NO monthly 2026 P&L actuals — its
-- only 2026 figures are the full-year Plan (Sales $4,679,751, EBITDA $380,260;
-- Summary / Plan sheets), and its monthly model starts in 2027. The one
-- monthly-granular 2026 sheet (2026 AR) is an accounts-receivable AGING report
-- (open unpaid balances), not sales, so it is not a revenue source.
--
-- Per direction, the monthly grid is populated rather than left blank:
--   * Plan   = the FY2026 Plan phased EVENLY across 12 months. An even split
--              matches the operating model, which runs revenue at a flat
--              ~$390K/mo (see Revenue Matrix_Monthly, 2027 existing revenue).
--   * Actual = set equal to Plan for the CLOSED months (Jan-Sep 2026) as a
--              tracking-to-plan placeholder, to be replaced cell-by-cell as
--              real monthly closes are booked. Oct-Dec (not yet closed) are
--              left blank.
-- Only Revenue and EBITDA have a reported annual figure to phase; Free Cash
-- Flow and Cash Balance have no 2026 source and are intentionally left blank.
--
-- Idempotent: updates the month/category rows seeded by migration 0005.
-- Revenue  4,679,751 / 12 = 389,979.25   EBITDA  380,260 / 12 = 31,688.33
-- ============================================================

-- Revenue — plan for all 12 months
update public.monthly_performance
   set plan_value = 389979.25
 where year = 2026 and category = 'Revenue';
-- Revenue — actual = plan for closed months (Jan-Sep)
update public.monthly_performance
   set actual_value = 389979.25
 where year = 2026 and category = 'Revenue' and month <= 9;

-- EBITDA — plan for all 12 months
update public.monthly_performance
   set plan_value = 31688.33
 where year = 2026 and category = 'EBITDA';
-- EBITDA — actual = plan for closed months (Jan-Sep)
update public.monthly_performance
   set actual_value = 31688.33
 where year = 2026 and category = 'EBITDA' and month <= 9;
