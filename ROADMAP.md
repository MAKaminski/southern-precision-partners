# Roadmap

Internal tracking of platform and process enhancements. Newest entries first.

## 2026-07-19 — Financial-model consistency audit (`npm run audit:financials`)

**Status:** Implemented. Follow-up required from a human (Keith/Michael) to confirm and correct the flagged figures.

**What:** Added `scripts/audit-financials.mjs`, an automated audit that re-derives every displayed
subtotal in `src/lib/data.ts` from its own line items (income statement waterfalls, cap stack,
uses of funds, EBITDA margins, investor MOICs, sensitivity matrix) and fails loudly on any
mismatch. Run with `npm run audit:financials`.

**Why:** The site publishes hand-entered deal figures to real lenders and investors
(`IncomeStatementTable`, `InvestorReturnCard`, `CapStackBar`, etc., all sourced from
`src/lib/data.ts`). There was no automated check that these numbers were internally consistent.

**What it found on first run — needs human review:**
- `incomeStatementPreInitiative`: the "Distributable FCF" row is understated by a constant
  **$23,200/year** relative to EBITDA − LP interest − seller note − capital reserve − taxes
  (e.g. Yr1 shows $141,990; components sum to $165,190).
- In both `incomeStatementPreInitiative` and `incomeStatementPostInitiative`, the "→ GP" and
  "→ JP" distribution rows don't sum to the "Distributable FCF" row above them (pre-initiative
  short by a constant $17,400/yr; post-initiative short by a growing $12.8K–$22.8K/yr).

These are the numbers backing the investor return claims (MOIC/IRR) on the live site, so a
human should confirm the intended tax/split assumptions before `src/lib/data.ts` is edited —
this audit deliberately does not silently "correct" investor-facing figures on its own.

**Next steps:**
- [ ] Keith/Michael confirms the intended Distributable FCF and GP/JP split formulas for both
      tables.
- [ ] Fix `src/lib/data.ts` to reconcile; `npm run audit:financials` should exit 0 afterward.
- [ ] Wire `audit:financials` into CI so future hand-edits to deal figures can't silently drift.

## Backlog (candidates for future hourly passes)

- No automated test suite exists yet (no Jest/Vitest configured) — consider adding component
  tests for the financial visualizations (`RevenueEBITDAChart`, `SensitivityHeatmap`, etc.).
- Home page shows "Actively Acquiring — Q1 2026" while Project Mosaic is dated April 2026 —
  minor copy inconsistency to reconcile.
- "Entry Multiple" metric renders with no value in the Active Deals card on the homepage.
- CI: no GitHub Actions workflow currently runs lint/build/audit on PRs.
