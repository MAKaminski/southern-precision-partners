# Roadmap

Internal tracker for incremental site enhancements. One entry is added (and implemented) roughly each review cycle.

## 2026-07-19 — Fix stale "current as of" quarter labels (DONE)

**Problem:** The homepage and deal-submission page hardcoded "Q1 2026" as the
"current" buy box / acquisition status, and the hero banner read "Actively
Acquiring — Q1 2026". As of this review the actual quarter is Q3 2026, so an
investor-facing page was claiming stale currency on its own criteria — a bad
look for a site whose whole pitch is precision and diligence.

**Fix:** Added `getCurrentQuarterLabel()` to `src/lib/utils.ts` and used it in
`src/app/page.tsx` and `src/app/submit/page.tsx` in place of the hardcoded
strings, so the quarter shown always reflects the latest deploy instead of
drifting out of date. Deal-specific dates (e.g. Project Mosaic's "April 2026"
listing date) were left untouched since those describe a specific deal
milestone, not "current" status.

**Files:** `src/lib/utils.ts`, `src/app/page.tsx`, `src/app/submit/page.tsx`

---

## Backlog / noticed but not yet actioned

- `deals/mosaic` and `layout.tsx` navigation use raw `<a>` tags for internal
  links instead of `next/link`'s `<Link>` — flagged by `next lint`
  (`no-html-link-for-pages`); worth a pass to swap these for client-side nav.
- `AuthNav.tsx` uses a raw `<img>` instead of `next/image` (LCP/bandwidth lint
  warning).
- Minor unused-variable lint warnings in `api/contacts/route.ts` and
  `api/download-model/route.ts`.
- No automated tests exist in the repo yet (no test runner configured) —
  consider adding at least smoke coverage for the financial calculations
  (LBO/return math) given the site's investor-facing numbers.
