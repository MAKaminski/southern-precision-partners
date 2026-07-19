# Roadmap

Internal backlog for southern-precision-partners. Entries are added by the
hourly site-review routine and by regular development. Newest first.

## 2026-07-19 — Fix Seller Note figure inconsistency + add financial data audit

**Status:** Done

The `/details` page (`DebtFacilityGrid`) displayed the Seller Note as
**$300K**, contradicting the cap stack, uses-of-funds, and total-raise
figures shown elsewhere on the same page, which all treat it as **$200K**
(6.5% of the $3.1M raise). The `keyRisks` copy also quoted "$2.7M total
debt at entry" — a figure only consistent with the wrong $300K note.

Fix:
- Corrected `debtFacilities` and `keyRisks` in `src/lib/data.ts` to the
  $200K / $2.6M figures that reconcile with `capStack` and `totalRaise`.
- Added `scripts/verify-financials.ts` (`npm run verify:financials`), a
  dependency-free consistency check that asserts cap stack, uses-of-funds,
  and debt facility figures reconcile with each other. No test framework
  exists in this repo yet, so this is a lightweight first step rather than
  full unit test coverage.

## Backlog (not yet scheduled)

- **Test framework.** The repo has zero automated tests (no Jest/Vitest,
  no CI workflow). `verify-financials.ts` is a stopgap; a real framework
  would let it (and future logic) run in CI on every PR.
- **CI workflow.** No `.github/workflows` exist — lint/typecheck/tests
  don't run automatically on push or PR.
- **Compute returns instead of hardcoding them.** All MOIC/IRR/waterfall
  figures in `src/lib/data.ts` are hand-typed strings with the arithmetic
  left in comments. Moving to a small pure calculation module (inputs →
  waterfall → MOIC/IRR) would make the numbers self-consistent by
  construction instead of by manual bookkeeping.
- **`next-auth` is on a beta release** (`^5.0.0-beta.30`); track GA and
  upgrade once available.
