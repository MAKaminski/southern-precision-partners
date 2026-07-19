# Roadmap

Running log of platform/process enhancements. One entry is added roughly
each review cycle; each entry links to the PR/commit that implemented it.

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
