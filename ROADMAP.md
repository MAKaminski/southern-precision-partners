# Roadmap

Running log of platform/process enhancements. One entry is added roughly
each review cycle; each entry links to the PR/commit that implemented it.

## 2026-07-19 — Delivery Plan: full inline editing + filters

**Status: Done**

Every column in the Delivery Plan table (`/delivery`) is now click-to-edit
and persists to `delivery_tasks` via `PATCH /api/delivery/[id]` — previously
only Status was editable. Added `EditableCell` (generic inline text/number/
date editor with optimistic update + revert-on-failure, same pattern as the
existing `DeliveryStatusSelect`) and `DeliveryPlanTable` (client component
handling filtering + rendering). Added filters for Year, Owner, System,
Status, and Start-date range.

Also fixed a bug found along the way: `/api/delivery` and `/api/forecast`
were still guarding at `"confidential"` clearance after the page-level tier
was changed to `"internal"` (partner-only) — meant an authenticated investor
could still write to those endpoints even though they can't view the pages.
Both now guard at `"internal"` to match.

**Backlog — not yet started:** Customer Forecast tab. The 2026 column on
`/customers` is YTD only, not a full-year figure — customer sales need a
month-by-month full-year estimate to make the numbers comparable across
years and to unify existing + new customer sales forecasting. Will need
more info per customer (typical tile purchase volume, our penetration %)
to build real numbers, not just a UI. Explicitly deferred per 2026-07-19
product direction — do not build until asked.

## 2026-07-19 — Fix incorrect tax/FCF figures in Pre-Initiative income statement + add financial audit script

**Status: Done**

The "Pre vs Post Initiative" comparison table on `/details` (rendered by
`IncomeStatementTable.tsx` from `incomeStatementPreInitiative` in
`src/lib/data.ts`) showed "Est. Taxes (25%)" and "Distributable FCF" values
that didn't actually compute to 25% of pretax FCF and didn't sum correctly —
off by a consistent $23,200/year across all 5 years, and diverging from the
parallel `scenario1CashFlows` table for the identical underlying scenario
(same revenue, EBITDA, and debt service). Investor-facing numbers on a live
deal page were wrong.

- Corrected the 5 years of "Est. Taxes" and "Distributable FCF" values to
  match the verified-correct `scenario1CashFlows` figures.
- Added `scripts/audit-financials.ts` (`npm run audit:financials`) — a
  standalone consistency checker with no new dependencies (uses Node 22's
  built-in TS execution) that verifies, for each cash-flow/income-statement
  table: taxes ≈ 25% of pretax FCF, distributable FCF = pretax − taxes, and
  partner allocations sum to distributable FCF. Run it after any edit to
  `src/lib/data.ts`.

**Follow-up (not yet implemented):** the audit script surfaced a second,
more ambiguous inconsistency — `incomeStatementPostInitiative` uses the
no-kicker 10% IO debt terms (Scenario 1) but a 79/16 GP/JP split that only
accounts for 95% of FCF, with no LP equity-kicker row to absorb the
remaining 5%. Needs a product decision (add an LP kicker row, or switch that
table to the 83/17 no-kicker split) before fixing — flagged in-code at
`src/lib/data.ts` above `incomeStatementPostInitiative` as
`AUDIT-FOLLOWUP`. Candidate for a future enhancement cycle.

## Process notes

- No test framework is configured yet (`package.json` has no `test`
  script). `scripts/audit-financials.ts` is a first, narrow step toward
  automated verification of the financial model; a proper unit-test setup
  (e.g. Vitest) for `src/lib/` is still a backlog item.
