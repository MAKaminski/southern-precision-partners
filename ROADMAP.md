# Roadmap

Lightweight internal tracker for incremental site enhancements. Newest entries first.

## 2026-07-20 — Financial data audit script

**Status:** Done
**Area:** Data integrity / testing

The site displays hand-entered MOIC/IRR/proceeds figures across the investor
return card, the full scenario table (Bear/Base/Bull/Stretch), and the cap
stack — with no automated check that they're internally consistent. History
shows these have drifted before (e.g. the "GP always 15%+ higher MOIC/IRR
than JP" fix). Added `scripts/audit-financials.ts` (run via
`npm run audit:financials`) which recomputes each MOIC from
`proceeds / invested` using the same `src/lib/data.ts` source of truth the
UI renders from, and checks cap stack / uses-of-funds totals reconcile to
`totalRaise`. Flags drift beyond 1.5% and exits non-zero, so it's ready to
wire into CI as a regression guard whenever the model numbers are edited.

## Backlog (not yet started)

- No automated test suite exists for the app at all (no jest/vitest, no
  `npm test`). The financial audit script above is a first step; consider a
  proper test runner if more component/logic coverage is wanted.
- `financial-calculations`, `submit-deal`, and `import-contacts` API routes
  have no request validation tests.
- No CI workflow in `.github/` — lint/build/audit don't run automatically
  on PRs.
