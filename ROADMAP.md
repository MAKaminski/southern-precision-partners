# Roadmap

Running log of platform/process enhancements. One entry is added roughly
each review cycle; each entry links to the PR/commit that implemented it.

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

## Process notes

- No test framework is configured yet (`package.json` has no `test`
  script). `scripts/audit-financials.ts` is a first, narrow step toward
  automated verification of the financial model; a proper unit-test setup
  (e.g. Vitest) for `src/lib/` is still a backlog item.
