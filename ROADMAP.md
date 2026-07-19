# Roadmap

Running log of platform/process enhancements. One entry is added roughly
each review cycle; each entry links to the PR/commit that implemented it.

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
