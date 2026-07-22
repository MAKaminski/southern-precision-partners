// ─── Changelog: feedback → changes-made ledger ───────────────────────────────
// For each piece of stakeholder feedback (registered in src/lib/sources.ts),
// this restates the original ask verbatim and then itemises exactly what was
// built to address it, where, and its status. It answers "someone gave us
// input — what did we actually do about it?" in an auditable, party-attributed
// form. The verbatim feedback itself is not duplicated here; it's pulled from
// the source registry by `sourceId` so there's one copy to keep honest.

export type ChangeStatus = "done" | "in-progress" | "planned";

export interface ChangeItem {
  /** What was built or changed. */
  what: string;
  /** Where it lives — a route and/or file. */
  where: string;
  status: ChangeStatus;
  /** Which specific ask (source excerpt heading) this addresses. */
  addresses?: string;
}

export interface ChangelogEntry {
  id: string;
  /** ISO date the response was delivered. */
  date: string;
  /** The feedback this responds to → src/lib/sources.ts. */
  sourceId: string;
  title: string;
  /** One-paragraph summary of how we responded. */
  responseSummary: string;
  changes: ChangeItem[];
}

export const CHANGE_STATUS_META: Record<
  ChangeStatus,
  { label: string; badgeClass: string }
> = {
  done: { label: "Done", badgeClass: "bg-accent-green/10 text-accent-green border-accent-green/20" },
  "in-progress": { label: "In progress", badgeClass: "bg-accent-amber/10 text-accent-amber border-accent-amber/20" },
  planned: { label: "Planned", badgeClass: "bg-accent-blue/10 text-accent-blue border-accent-blue/20" },
};

// ── Response to Keith's BI input (2026-07-20) ────────────────────────────────
const keithBiResponse: ChangelogEntry = {
  id: "cl-keith-bi-2026-07-20",
  date: "2026-07-20",
  sourceId: "keith-bi-input-2026-07-20",
  title: "BI requirements captured as reports + sourcing/changelog scaffolding",
  responseSummary:
    "Every BI requirement from Keith's note was catalogued in a new Reports appendix — each with its question, formula, grain, and data source. Requirements that need line-level sales/product/associate/discount data (not captured in the schema yet) are recorded as fully-defined specs rather than back-filled with invented numbers, and each names the layered object that will serve it once ETL lands. Alongside the reports, a sourcing/auditability layer now attributes every addition to the requesting party, and this Changelog restates the original ask against what was delivered.",
  changes: [
    {
      what: "New Reports tab — an appendix of analytics views (live views + the 8 requested BI reports), each with question, definition, grain, data source, and status.",
      where: "/reports · src/app/reports/page.tsx · src/lib/reports.ts",
      status: "done",
    },
    {
      what: "Sourcing/auditability registry + inline SourceTag credit, so every addition is traceable to the party, channel, and date that requested it.",
      where: "src/lib/sources.ts · src/components/SourceTag.tsx",
      status: "done",
    },
    {
      what: "This Changelog tab — restates each party's original feedback and the changes made to address it.",
      where: "/changelog · src/app/changelog/page.tsx · src/lib/changelog.ts",
      status: "done",
    },
    {
      what: "Mix Rate GM% bridge (mix vs rate) defined as a spec — needs line-level sales + unit cost; will be served by serving.gm_mix_bridge on core.fact_sales_line.",
      where: "/reports#mix-rate",
      status: "planned",
      addresses: "Mix Rate",
    },
    {
      what: "Customer Trend & Lever Map — sales trend and segment ranking are backable now from customer_annual_sales + customers.segment; margin/lever tagging flagged as pending line-level GM.",
      where: "/reports#customer-trend · /customers",
      status: "in-progress",
      addresses: "Customer trend",
    },
    {
      what: "Attachment % (core vs attach, Pro/DIY) defined as a spec — needs order-line data + a core/attach SKU taxonomy.",
      where: "/reports#attachment-rate",
      status: "planned",
      addresses: "Attachment %",
    },
    {
      what: "P&L High-Level Themes — underlying P&L is live (forecast_pnl / opex_gl / monthly_performance); the role-relevant theme narrative is the remaining build.",
      where: "/reports#pnl-themes · /forecast · /summary",
      status: "in-progress",
      addresses: "P&L high-level themes",
    },
    {
      what: "Per-Associate KPI Scorecard (YoY sales, GM% vLY, % orders tied to account) defined as a spec — needs a salesperson dimension + order→account linkage.",
      where: "/reports#associate-kpi",
      status: "planned",
      addresses: "Per-associate KPI achievement",
    },
    {
      what: "Discretionary Discount Visibility defined as a spec — needs list-vs-sold price on line items.",
      where: "/reports#discretionary-discounts",
      status: "planned",
      addresses: "Discretionary discounts",
    },
    {
      what: "AI Theme Detection scoped to run on the reports' outputs via the existing Anthropic chat integration.",
      where: "/reports#ai-theme-detection",
      status: "planned",
      addresses: "AI theme detection",
    },
    {
      what: "Weekly All-Hands Digest scoped as a one-page Monday assembly of the mix/customer/attach/P&L/associate reports (themes, wins, per-associate numbers).",
      where: "/reports#weekly-all-hands",
      status: "planned",
      addresses: "Weekly all-hands digest",
    },
  ],
};

// ── Response to Michael's Landbase SC prospect drop (2026-07-22) ─────────────
const landbaseResponse: ChangelogEntry = {
  id: "cl-landbase-sc-2026-07-22",
  date: "2026-07-22",
  sourceId: "landbase-sc-prospects-2026-07-22",
  title: "Landbase SC prospects integrated as a Pro pipeline + enrichment candidates",
  responseSummary:
    "The two uploaded CSVs (213 SC construction/remodeling companies + 369 named decision-makers) were normalized, joined, and loaded into two new tables behind a DB-backed /prospects tab, ranked by a transparent in-house fit score and grouped by SC-expansion territory. Where a prospect appears to already be an existing customer, it's flagged as a non-destructive enrichment candidate — nothing is written back to customer records automatically, because customer names in the current data are truncated (~14 chars) and match on prefix.",
  changes: [
    {
      what: "New prospect_companies + prospect_contacts tables (migration 0014) with fit_score, SC territory, and a non-destructive matched_customer_id link.",
      where: "supabase/migrations/0014_prospects_schema.sql",
      status: "done",
      addresses: "Integrate the prospect list",
    },
    {
      what: "Idempotent seed of 213 companies + 369 contacts, plus a prospect→customer match UPDATE that writes only to prospect_companies.",
      where: "supabase/migrations/0015_seed_prospects.sql",
      status: "done",
      addresses: "Integrate the prospect list",
    },
    {
      what: "DB-backed /prospects tab — searchable/filterable explorer by region, fit tier, and reachability; expandable firmographics + decision-maker contacts with LinkedIn.",
      where: "/prospects · src/app/prospects/page.tsx · src/components/spp/ProspectsExplorer.tsx",
      status: "done",
      addresses: "Integrate the prospect list",
    },
    {
      what: "Enrichment-candidates view — prospects matched to existing customers surfaced for review; NOT auto-written to customer records.",
      where: "/prospects (candidates callout + filter) · /reports#customer-enrichment-candidates",
      status: "done",
      addresses: "Enrich existing customers",
    },
    {
      what: "Two live reports added to the Reports appendix (Pro Prospect Pipeline; Existing-Customer Enrichment Candidates), and the drop registered in the sourcing registry.",
      where: "src/lib/reports.ts · src/lib/sources.ts",
      status: "done",
    },
    {
      what: "Migrations ship in the PR; applying them to the live Supabase project is deferred until approved (matches the layered-schema rollout).",
      where: "supabase/migrations/0014–0015",
      status: "planned",
    },
  ],
};

export const CHANGELOG: ChangelogEntry[] = [landbaseResponse, keithBiResponse];

export function changelogForSource(sourceId: string): ChangelogEntry[] {
  return CHANGELOG.filter((e) => e.sourceId === sourceId);
}
