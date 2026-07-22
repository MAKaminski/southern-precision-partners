# Roadmap

Running log of platform/process enhancements. One entry is added roughly
each review cycle; each entry links to the PR/commit that implemented it.

## 2026-07-22 — Landbase SC prospects: /prospects pipeline + customer-enrichment candidates

**Status: Code done; live DB apply deferred to approval**

Integrated an uploaded two-file Landbase export ("Atlanta roof replacement
pros" — actually South Carolina construction/remodeling firms, the Pro buyer
for the SC expansion): **213 companies + 369 named decision-makers**.

- **New tables** `prospect_companies` + `prospect_contacts` (migration
  `0014_prospects_schema.sql`) — RLS deny-by-default, updated_at triggers,
  natural unique keys (`company_key` / `contact_key`) for idempotent seed.
  `fit_score` is a transparent in-house heuristic (revenue band + tile/remodel
  keyword fit + decision-maker seniority + reachability); the export's own
  Fit/Relevance columns came back empty. `region` tags SC-expansion territory
  (Columbia 167, Florence 23, Sumter 14, …).
- **Seed** `0015_seed_prospects.sql` — idempotent INSERT…ON CONFLICT for both
  tables, plus a **non-destructive** UPDATE that links a prospect to an
  existing customer where its normalized name prefix-matches a (truncated)
  customer `name_key`. Writes only to `prospect_companies` — customer records
  are never mutated.
- **`/prospects` tab** (`src/app/prospects/page.tsx` + client
  `ProspectsExplorer`) — DB-backed, ranked by fit, filterable by region / fit
  tier / reachability, expandable firmographics + contacts (LinkedIn). Plus an
  enrichment-candidates callout for the ~15–25 prospects that look like
  existing customers (reviewable, not auto-applied — customer names are
  truncated ~14 chars, so matches are prefix-based).
- Registered `/prospects` in `NAV_LINKS` + `ROUTE_RULES` (internal). Added two
  live reports to the Reports appendix (Pro Prospect Pipeline; Existing-Customer
  Enrichment Candidates), a `sources.ts` provenance entry, and a Changelog
  entry.

Verified: typecheck clean, lint 0 errors, build succeeds (`/prospects`
present), audit:financials passes. Seed SQL statically validated (213×19 +
369×9 fields, quote/paren balance). **Migrations 0014–0015 are NOT yet applied
to the live Supabase project** — deferred to approval per direction; the tab
shows an "apply migrations" state until then.

## 2026-07-20 — Keith BI input: Reports appendix + sourcing/auditability + Changelog tab

**Status: Done**

Keith emailed a set of BI requirements ("Mosaic - BI Input", 2026-07-20) —
mix rate, customer trend, attachment %, P&L themes, per-associate KPIs, AI
theme detection, discretionary-discount visibility, and a 15–30 min Monday
all-hands digest. Integrated all of it, plus the sourcing/auditability and
changelog scaffolding requested alongside:

- **Reports tab (`/reports`, `src/app/reports/page.tsx`, `src/lib/reports.ts`)**
  — an appendix of analytics views. Indexes the 9 live views already in the
  platform (Summary, Forecast, Customers, AR aging, Delivery, HR, Marketing,
  ERD, SQL) *and* catalogues Keith's 8 requested reports, each with its
  question, definition, grain, data source, and a `live | spec | planned`
  status.
- **Honesty about data:** the schema has NO line-level sales / product-SKU /
  salesperson / discount data (only summary `customer_annual_sales`,
  `ar_transactions`, and monthly/annual P&L aggregates). So mix rate,
  attachment %, per-associate KPIs, and discount visibility are recorded as
  fully-specified `spec` reports — not back-filled with invented numbers —
  each naming the layered `core.fact_*` / `serving.*` object (from the 0012
  scaffold) that will serve it once ETL lands. Customer-trend and P&L-themes
  are partially live today.
- **Sourcing / auditability (`src/lib/sources.ts`, `src/components/SourceTag.tsx`)**
  — a registry attributing every addition to the requesting party, channel,
  and date, with Keith's verbatim asks captured. An inline `SourceTag`
  ("Requested by Keith Piper · …") renders on each requested report so the
  provenance is visible on the surface itself.
- **Changelog tab (`/changelog`, `src/app/changelog/page.tsx`,
  `src/lib/changelog.ts`)** — restates each party's original feedback verbatim
  (pulled from the source registry) beside the itemised changes made to
  address it, with per-item status and file/route pointers.
- Registered both routes in `NAV_LINKS` (`src/lib/nav-links.ts`) and
  `ROUTE_RULES` (`src/lib/access.ts`, both `internal`/partner-only).

Verified: `npm run typecheck` clean, `npm run lint` 0 errors (6 pre-existing
warnings), `npm run build` succeeds with `/reports` + `/changelog` present,
`npm run audit:financials` passes. No migrations or data changes — additive UI
+ registries only.

## 2026-07-20 — Backlog hygiene: closed 5 stale draft PRs (Linear MOD-17)

**Status: Done**

Linear [MOD-17](https://linear.app/modular-equity/issue/MOD-17) has flagged
for over a day that draft PRs from hourly review cycles were piling up
unmerged. Checking each open PR against the current `main` this cycle found
that #28 ("Rebuild 5-yr financial model on real SBA deal structure"), #29
("Wire `audit:financials` into CI"), and #5 ("Public/private guardrails")
— all already merged — silently obsoleted five of the eleven still-open
draft PRs:

- **#6** and **#20** — both correct the Seller Note from $300K → $200K in
  the *old* cap stack. #28 rebuilt the model from scratch; the Seller Note
  is now $280K under different SBA + Seller Note terms. Neither $200K nor
  $300K appear anywhere in `data.ts` anymore — merging either would
  reintroduce numbers that don't reconcile with the rest of the model.
- **#24** — wires `audit:financials` into CI. Already done by #29.
  Merging now would conflict with `.github/workflows/ci.yml`.
- **#26** — adds `src/lib/data.test.ts`, a first automated test suite for
  the financial model. It imports `financialYearsPreInitiative`,
  `scenario1CashFlows`, `incomeStatementPreInitiative`, and other exports
  that #28 removed entirely (replaced by `financialYears` +
  `cashFlowProjections`). Merging as-is would fail to build. The
  underlying goal is still valuable — Linear
  [MOD-9](https://linear.app/modular-equity/issue/MOD-9) stays open for a
  fresh attempt against the current `data.ts` shape.
- **#21** — adds an auth check to `src/middleware.ts`, a file that no
  longer exists (`main` renamed it to `src/proxy.ts` in #5, which merged
  *before* #21 was opened). The gap it targets (unauthenticated
  `/api/contacts`, `/api/import-contacts`, `/api/download-model`) is
  already closed on `main` by #5's `access.ts` + `proxy.ts` classification
  system — confirmed by reading current `main`, not assumed.

All five closed with an explanatory comment on GitHub rather than left to
rot or accidentally merged. This does **not** fully close MOD-17: six other
open draft PRs (#4, #13, #18, #19, #23, #25) are still valid, unmerged
fixes for real, currently-live issues (stale "Q1 2026" label on the live
homepage, stale chatbot model ID, `/api/health` endpoint, deal-submission
persistence) — those need a human merge/triage pass, not another
autonomous PR piled on top.
## 2026-07-20 — TEMPORARY: investor role granted full partner clearance

**Status: Done — needs revert once Google sign-in is confirmed fixed**

Google OAuth sign-in is still broken (account-picker issue persists after the
`prompt: "select_account"` fix in PR #27), so real partners cannot reliably
reach the "partner" role. Per direct instruction, `src/lib/access.ts`'s
`ROLE_RANK` now grants `investor` the same clearance rank as `partner` (2),
so any authenticated investor can reach internal ops tooling (CRM, outreach,
delivery, forecast — previously partner-only) in addition to confidential
deal materials, not just the confidential tier.

**This is a real widening of who can see internal ops data (contact PII,
outreach templates, delivery/forecast) — intentional and temporary.**
Revert `investor: 2` back to `investor: 1` in `src/lib/access.ts` once Google
sign-in is confirmed working end-to-end.
## 2026-07-20 — Wire `audit:financials` into CI; bump CI to Node 22; process check-in

**Status: Done**

`scripts/audit-financials.ts` (added 2026-07-19) has already caught two real
investor-facing bugs this week (Seller Note $200K/$300K mismatch, a
$23,200/yr tax/FCF error) — but `.github/workflows/ci.yml` never ran it, only
lint/typecheck/build. Added it as a CI step after `build`, and bumped
`actions/setup-node` from Node 20 → 22, since the script imports
`src/lib/data.ts` with a `.ts` extension using Node 22's built-in TypeScript
execution (fails on Node 20).

**Process check-in this cycle (no code change, just current state for the
next review):**

- `AUTH_SECRET` is confirmed **still unset** — `main`'s `src/app/api/`
  currently has no `/api/health` endpoint (that lives only in unmerged PR
  #23), so this can't yet be checked with a single curl; it was previously
  confirmed broken via Vercel's runtime-error API and no fix has landed.
  This remains the single highest-priority open item (Linear MOD-21,
  Urgent) — it needs a human with Vercel dashboard access.
- The repo currently has **11 open draft PRs** (#4, #6, #13, #18, #19, #20,
  #21, #23, #24, #25, #26), all opened against an older `main` commit
  (`deea8dd`) that is now 5 commits behind current `main` (`2b6202f`).
  Cross-checking their premises against current `main` found several are
  now **stale/already resolved**, not just unreviewed:
  - #6 / #20 (Seller Note $300K→$200K): moot — `main` already carries the
    Seller Note at a consistent $280K (SBA-restructure PR #17).
  - #20's `verify-financials` script: redundant — `scripts/audit-financials.ts`
    already merged via PR #15.
  - #21 (auth on `/api/contacts`, `/api/download-model`,
    `/api/import-contacts`): redundant — `main`'s `src/lib/guard.ts` +
    `requireClearance("internal")` (merged via PR #5) already gates
    `/api/contacts` and `/api/download-model` at the handler level.
  - #19 (verify `proxy.ts` is correct): moot — `main` has run with
    `src/proxy.ts` for a while now with no reported regression.
  - #13 (chatbot model un-pin) and #18 (stale "Q1 2026" label) are each
    still genuinely unfixed on `main` — confirmed via direct grep, not
    superseded by anything else.
  - #24 (this CI wiring), #25 (persist deal submissions to Supabase — still
    just `console.log`s on `main`), and #26 (test suite) are still genuinely
    open and unaddressed; #24 is now implemented by this entry directly on
    latest `main` instead of rebasing the stale PR.

  **Recommendation:** a human merge/triage pass on the PR queue is overdue —
  several of these can be closed as superseded without needing careful
  reconciliation, which should make the remaining review lighter than the
  raw count of 11 suggests.
## 2026-07-19 — CRITICAL: production auth is completely broken (missing AUTH_SECRET)

**Status: Diagnosed, NOT fixed — requires a human to set a Vercel env var**

Nobody has been able to sign in (Google OR email) since **2026-04-09**. Vercel
runtime error logs show `[auth][error] MissingSecret: Please define a
"secret"` — 1,945 occurrences, 25 affected users, still firing as of this
entry. `AUTH_SECRET` (required by NextAuth v5 in production) has never been
set in the Vercel project's environment variables. No code change can fix
this — an agent has no way to write Vercel env vars, and a secret shouldn't
be hardcoded into the repo anyway.

**Action needed:** In Vercel → Project Settings → Environment Variables, add
`AUTH_SECRET` (Production, and Preview if desired) with a random 32-byte
value, e.g. generate one locally with `openssl rand -base64 32`. Redeploy
after adding it.

**Why this matters beyond login being broken:** while `auth()` was failing
with this error, `src/proxy.ts`'s clearance check had a fail-open bug (fixed
in #5 today) that treated the resulting truthy-but-userless error object as
an authenticated "investor" session. That means confidential pages
(`/details`, `/deals/mosaic`) were likely reachable by anonymous visitors
for the ~3.5 months this has been broken, until the #5 fix deployed. Worth
confirming nothing was scraped/leaked in that window.
## 2026-07-19 — Capital structure update: SBA financing replaces "Pete" LP debt

**Status: Partially done — Sources/Uses updated; downstream returns model NOT rebuilt**

Per direction: the deal now targets ~$17M Year-5 sales (per the "Mosaic"
planning sheet in Google Drive, last edited 2026-07-19), financed as
$2.8M purchase price via:
- SBA Term Loan (Live Oak Bank): $2.24M, 10%, 15-yr term
- SBA Working Capital LOC (Live Oak Bank): $250K revolving (separate facility,
  not part of the initial raise)
- Managing Partner (Keith Piper) equity: $280K (10% of purchase price)
- Seller financing: $280K (10%)
- Junior Partner: $100K — carried over unchanged; **not mentioned in the new
  plan, needs confirmation it still applies**

Updated: `capStack`, `totalRaise`, `usesOfFunds`, `debtFacilities` in
`src/lib/data.ts`; the Sources & Uses tab and capital-structure panel in the
downloadable XLSX (`download-model/route.ts`); the chatbot KB and system
prompt (`chat/route.ts`); the CRM outreach email template; `FullScenarioCards`
(removed the LP row — bank debt doesn't have a MOIC the way the old
debt-with-equity-kicker LP did); removed the LP row from `investorReturns`.
Also fixed the stale "April 2026" target-close date to "Q3 2026" in three
places (`/`, `/deals/mosaic`, downloadable model).

**NOT done — flagged `AUDIT-FOLLOWUP` in-code everywhere it applies:** the
exit-waterfall / MOIC / IRR model (`investorReturns` GP/JP rows,
`scenario1`/`scenario2`/`scenario1CashFlows`/`scenario2CashFlows`,
`fullScenarios`, `scenarios`, the chatbot's waterfall/returns KB entries, the
XLSX waterfall tab) all still reflect the **prior** $400K/79%-profit-share
Keith equity and $2.4M LP-debt structure. These are cascading calculations
(interest → taxes → distributable FCF → GP/JP split → MOIC/IRR) — updating
the equity/debt inputs without re-deriving the whole chain would silently
introduce new inconsistencies, exactly the kind `audit-financials.ts` exists
to catch. This needs a deliberate model rebuild against the new $280K Keith
equity figure, not a find-and-replace. `kpiStats`' "Enterprise Value: $2.49M"
/ "Entry Multiple: 4.5×" also weren't touched and now sit inconsistently next
to the new $2.8M purchase price — same reason (depends on resolving which
EBITDA/revenue basis is authoritative: the live site's $554K pro-forma vs.
the planning sheet's $380K 2026 baseline).
## Process notes

- `README.md` now documents required environment variables (`AUTH_SECRET`,
  `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) —
  added today after discovering `AUTH_SECRET` was never configured.
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
## 2026-07-19 — Persist deal submissions to Supabase instead of dropping them

**Status: Done**

`src/app/api/submit-deal/route.ts` (the `/submit` page's backend) only
`console.log`'d incoming deal submissions — nothing was written to a
database or emailed out, so every real investor/seller lead through the
live public form was silently lost with no record (Linear MOD-11, filed
earlier today, High priority, previously unaddressed by any open PR).

- Added a `deal_submissions` table to the `southern-precision-partners`
  Supabase project (migration `add_deal_submissions_table`), RLS-enabled
  with no anon/authenticated policies — same deny-by-default pattern as
  every other table in this schema (`customers`, `delivery_tasks`, etc.).
- Wired the route to insert via the existing service-role client
  (`getSppDb()` from `src/lib/spp-db.ts`) rather than adding a new one.
- If Supabase isn't configured (or the insert fails), the route now logs
  the full submission with its reference number instead of dropping it
  silently — a fallback trace, not a swallow — and still returns success
  to the submitter either way, so the form UX is unaffected.
- Verified the insert path directly against the live table (test row
  inserted and deleted via the Supabase SQL tool) and the graceful-fallback
  path locally (`npm run dev`, unconfigured Supabase key → still logs +
  returns `200`).

**Why this over other backlog items this cycle:** every open draft PR
(#24, #23, #21, #20, #19, #18, #13, #6, #4 — tracked in MOD-17) already
covers a different area, so this doesn't add another overlapping change to
the pile. MOD-21 (Urgent — Vercel `AUTH_SECRET` missing) remains the
highest-priority open item but needs Vercel dashboard access this session
doesn't have; MOD-11 (Southeast vs Southern brand inconsistency) was
considered but deferred — it needs a human product decision (email/domain
identity is genuinely ambiguous across `sep-partners.com` vs the
`southern-precision-partners` repo/deploy domain, not a mechanical fix).
## 2026-07-19 — `/api/health` status endpoint (AUTH_SECRET still missing, confirmed live)

**Status: Done (endpoint); underlying config issue still NOT fixed**

Re-checked the `MissingSecret` error below via Vercel's runtime-error API before
starting this cycle: it's still firing — last occurrence 2026-07-19T16:57:09Z,
~4 hours before this entry, 2,078 occurrences / 32 users total. `AUTH_SECRET`
has still not been set in Vercel. Since the fix requires writing a Vercel
project env var (outside what an agent can do), this cycle shipped the next
best thing: `GET /api/health` (public, `src/app/api/health/route.ts`) reports
`{ ok, checks: { authSecret, googleOAuth, supabase, anthropicApiKey } }` —
booleans only, never secret values — with a `503` when a required one
(`authSecret` or `supabase`) is missing. Previously the only way to notice
this outage was to read provider error logs; now `curl .../api/health` (or
any uptime monitor pointed at it) answers in one request. Verified locally:
returns `503` with `authSecret: false` against an empty environment.

Also checked whether the ~3.5-month exposure window (2026-04-09 to the `#5`
proxy fail-closed fix, deployed 2026-07-19T16:09 UTC) can be conclusively
audited for scraping/leakage: Vercel's `get_runtime_errors` tool caps lookback
at 7 days, so this session's tool access can't confirm or rule that out.
Flagging as still open — would need the Vercel dashboard's own log retention
(if longer) or access logs from another source.
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
## 2026-07-20 — Process: session started on a 17-commit-stale branch; documented the guard, finished PR #19 triage

**Status: Done**

This review cycle's branch (`claude/epic-babbage-g6arg6`, a fixed name reused
every hour) still pointed at an old `main` commit — 17 merged commits behind,
including PR #15 (the Pre-Initiative FCF/Taxes fix) and PR #28 (the full SBA
capital-structure rebuild). Diagnosing the site against that stale checkout
reproduced the *exact* $17,400/yr FCF bug PR #15 already fixed, plus a
Seller Note `$200K`/`$300K` mismatch that no longer exists post-#28 — a full
fix was built and a PR opened (#32) before the staleness was caught by
comparing `HEAD..origin/main`. Closed #32 immediately as redundant/moot;
no code from it landed.

This is the same failure mode already visible across the PR queue (Seller
Note fixed independently 3× — #2/#6/#12; the FCF bug diagnosed twice with
different numbers — #7 vs #9) — it isn't a one-off. Ran
`npm run audit:financials` against current `main` to confirm: **it already
passes cleanly**, so there is no live financial-calculation bug to fix this
cycle.

- Added a "Before starting work: check branch freshness" section to
  `AGENTS.md` — a permanent instruction (read by every session via
  `CLAUDE.md`'s `@AGENTS.md` import) to `git fetch origin main` and diff
  against `HEAD` before diagnosing anything, and to check open PRs before
  starting a fix.
- Closed PR **#19** — its own body already concluded (per the 2026-07-20 CI
  entry above) that it was moot, but nobody had acted on that conclusion.
  Finishes the triage pass PR #31 did for #6/#20/#21/#24/#26.

**Still open, still genuinely unaddressed (do not duplicate):** #13
(chatbot pinned to stale model ID), #18 (stale "Q1 2026" label), #23
(`/api/health` endpoint), #25 (persist deal submissions to Supabase). None
of these are superseded by anything on current `main` — they're waiting on
a human merge pass, not on more diagnosis.
