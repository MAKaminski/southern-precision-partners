// ─── Reports registry (BI appendix) ──────────────────────────────────────────
// A catalogue of the analytics views we look at, in one place. Two kinds of
// entry live here side by side:
//
//   * "live"    — a report that is already backed by real data and surfaced by
//                 an existing tab (linked via `liveRoute`).
//   * "spec"    — a report that is fully defined (question, formula, grain) but
//                 cannot be computed yet because the source data isn't captured.
//                 It states exactly what's missing (`gap`) and which layered
//                 object will serve it once ETL lands (`servedBy`).
//   * "planned" — a report that composes/derives from the others and is built
//                 last (AI theming, the weekly digest).
//
// IMPORTANT — honesty about data: the current Supabase schema has NO
// transactional sales, product/SKU, salesperson, or discount data. Only
// summary-level figures exist (customer_annual_sales, ar_transactions,
// monthly/annual P&L aggregates, customers.segment). Reports that need
// line-level data are therefore `spec`, not fabricated. See docs/DATA_
// ARCHITECTURE.md for the raw → core → analytics → serving layering that the
// specs target.
//
// Every entry that came from a party's request carries `sourceId` +
// `sourceExcerpt` pointing at src/lib/sources.ts, so the appendix is auditable.

import { keithBiInput, landbaseScProspects } from "@/lib/sources";

export type ReportStatus = "live" | "spec" | "planned";

export interface Report {
  id: string;
  title: string;
  /** Grouping shown as a section header on the Reports tab. */
  category: string;
  /** The business question the report answers (the requester's ask, tightened). */
  question: string;
  /** How it is computed / what it shows — the spec, precise enough to build from. */
  definition: string;
  /** The reporting grain, e.g. "product category × month, YoY bps". */
  grain: string;
  /** Where the numbers come from today, or what data is required. */
  dataSource: string;
  status: ReportStatus;
  /** Attribution → src/lib/sources.ts. */
  sourceId?: string;
  /** Which excerpt heading in the source this report answers. */
  sourceExcerpt?: string;
  /** Existing route that already surfaces this (for `live` / partially-live). */
  liveRoute?: string;
  /** Layered object that will serve this once data lands (spec/planned). */
  servedBy?: string;
  /** For spec/planned: what is missing to make it live. */
  gap?: string;
}

const KEITH = keithBiInput.id;

// ── Keith's requested BI reports (source: "Mosaic - BI Input", 2026-07-20) ────
export const requestedReports: Report[] = [
  {
    id: "mix-rate",
    title: "Mix Rate — GM% bridge (mix vs rate)",
    category: "Margin & Mix",
    question:
      "How much of our YoY GM% change is product-portfolio mix shift, and how much is rate/cost movement on like items?",
    definition:
      "Decompose the YoY GM% change (in bps) into two effects: (a) MIX — the shift in sales weight across product categories, held at prior-year margins; and (b) RATE — the margin change on like-for-like items, isolating how much input-cost change we are absorbing versus passing through. Presented as a waterfall from LY GM% to CY GM%.",
    grain: "Product category × month, YoY bps bridge",
    dataSource:
      "REQUIRES line-level sales with product/SKU and unit cost. Not captured in the current schema (no product or order-line tables).",
    status: "spec",
    sourceId: KEITH,
    sourceExcerpt: "Mix Rate",
    servedBy:
      "serving.gm_mix_bridge (new) built on core.fact_sales_line + core.dim_product; analytics.figure already defines a 'gm' metric_code, currently unpopulated.",
    gap: "No product/SKU or order-line data yet — needs a POS/ERP line-item export with cost.",
  },
  {
    id: "customer-trend",
    title: "Customer Trend & Lever Map",
    category: "Customer",
    question:
      "Which customers and customer types are driving or dragging performance, and what lever (DIY upsell / Pro attach / new demographic) does each imply?",
    definition:
      "Rank customers and segments by YoY sales delta and margin contribution. Tag each with the indicated lever — upsell for DIY, attach for Pro full-project needs — and flag segment/demographic shifts to reconsider given the macro backdrop.",
    grain: "Customer and segment × year",
    dataSource:
      "PARTIALLY LIVE — customer_annual_sales (annual $ per customer) and customers.segment support the sales trend and ranking today. Margin contribution and lever tagging still need line-level GM.",
    status: "spec",
    sourceId: KEITH,
    sourceExcerpt: "Customer trend",
    liveRoute: "/customers",
    servedBy:
      "serving.customer_summary + core.dim_segment (b2b_tier1/2/3, individual_repeat/single) for the segment cut.",
    gap: "Sales trend is available now; margin-per-customer and attach behaviour need line-level data.",
  },
  {
    id: "attachment-rate",
    title: "Attachment % (core vs attach)",
    category: "Margin & Mix",
    question:
      "Are we winning the full tile system (core + attach items) or getting price-shopped item-by-item?",
    definition:
      "Classify SKUs as core versus attach, then measure attach dollars and units as a % of core across baskets, split by Pro versus DIY. Persistently low attach on core-heavy baskets signals we're being price-shopped; high attach signals we're the destination for the full addressable tile system.",
    grain: "Basket / order × core-vs-attach × Pro/DIY",
    dataSource:
      "REQUIRES order/basket line items plus a core/attach SKU taxonomy. Neither exists today.",
    status: "spec",
    sourceId: KEITH,
    sourceExcerpt: "Attachment %",
    servedBy: "serving.attach_rate (new) on core.fact_sales_line + a core/attach flag on core.dim_product.",
    gap: "No order-line data and no core/attach item map — needs POS export + a product taxonomy.",
  },
  {
    id: "pnl-themes",
    title: "P&L High-Level Themes",
    category: "P&L",
    question:
      "What are the few P&L themes each associate should know this week, framed to their role?",
    definition:
      "Surface the largest movers in the P&L — revenue, GM%, and opex lines — versus plan and versus LY, and distil them into a short, role-relevant narrative so every associate knows what's pertinent to their part of the business.",
    grain: "P&L line × month, plan vs actual vs LY",
    dataSource:
      "Underlying figures are LIVE — forecast_pnl, forecast_opex_gl, and monthly_performance (plan vs actual). The theming/narrative layer is the new work.",
    status: "spec",
    sourceId: KEITH,
    sourceExcerpt: "P&L high-level themes",
    liveRoute: "/forecast",
    servedBy: "serving.forecast_pnl + serving.opex_gl + serving.monthly_summary.",
    gap: "P&L data is live; the plain-language theme summary per role is what remains to build.",
  },
  {
    id: "associate-kpi",
    title: "Per-Associate KPI Scorecard",
    category: "People",
    question:
      "Per associate: YoY sales, GM% vs LY, and % of orders tied to a customer account — so each person's KPI achievement is measurable.",
    definition:
      "One scorecard row per associate: YoY sales, GM% versus LY, and the share of their orders attached to a named customer account, each compared to that individual's KPI target. Feeds the Monday all-hands 'real numbers per associate'.",
    grain: "Associate × period",
    dataSource:
      "REQUIRES a salesperson/associate dimension on transactions and an order→account linkage. Neither exists — hr_employees is roster/pay only, with no sales attribution.",
    status: "spec",
    sourceId: KEITH,
    sourceExcerpt: "Per-associate KPI achievement",
    liveRoute: "/hr",
    servedBy: "serving.associate_scorecard (new) joining core.fact_sales_line → core.dim_associate.",
    gap: "No associate-level sales attribution — needs POS export tagging the writing associate + an account flag.",
  },
  {
    id: "discretionary-discounts",
    title: "Discretionary Discount Visibility",
    category: "Pricing",
    question:
      "Where are we giving discretionary discounts — so we can replace them with a productivity-driven offer instead of discounting?",
    definition:
      "Track discretionary discount dollars and % (sold price vs list) by customer, associate, and item, and trend it down as productivity initiatives land — the goal being a favourable standing offer that doesn't rely on ad-hoc discounting.",
    grain: "Order line × sold-vs-list price",
    dataSource: "REQUIRES line-level list price versus sold price. Not captured on any transaction table today.",
    status: "spec",
    sourceId: KEITH,
    sourceExcerpt: "Discretionary discounts",
    servedBy: "serving.discount_detail (new) on core.fact_sales_line (list_price, sold_price).",
    gap: "No pricing/discount fields on transactions — needs list-vs-sold price in the POS export.",
  },
  {
    id: "ai-theme-detection",
    title: "AI Theme Detection",
    category: "Operating Cadence",
    question: "What themes would a fixed weekly report template miss?",
    definition:
      "An AI pass over the week's figures and notes that surfaces emergent themes and anomalies a static weekly template wouldn't catch, feeding the Monday all-hands. Reuses the existing Anthropic chat integration.",
    grain: "Weekly, across all report outputs",
    dataSource:
      "Runs on top of the other reports' outputs; uses the existing ANTHROPIC_CHAT_MODEL integration already in src/app/api/chat.",
    status: "planned",
    sourceId: KEITH,
    sourceExcerpt: "AI theme detection",
    gap: "Depends on the reports above producing real numbers first; wire once line-level data lands.",
  },
  {
    id: "weekly-all-hands",
    title: "Weekly All-Hands Digest (15–30 min Monday)",
    category: "Operating Cadence",
    question:
      "A 15–30 minute Monday all-hands: key themes, wins to celebrate, and each associate's real-number impact.",
    definition:
      "A one-page Monday digest assembling the mix, customer, attach, P&L-theme, and associate-KPI reports into a tight agenda — themes for the week, wins to celebrate, and per-associate numbers — sized for a 15–30 minute stand-up that keeps everyone aligned.",
    grain: "Weekly, one page",
    dataSource: "Composed from the reports above; becomes fully real as each of them becomes live.",
    status: "planned",
    sourceId: KEITH,
    sourceExcerpt: "Weekly all-hands digest",
    gap: "Assembles the other reports — build once they carry real numbers.",
  },
];

// ── Prospecting & enrichment (source: Landbase SC export, 2026-07-22) ─────────
export const prospectingReports: Report[] = [
  {
    id: "pro-prospect-pipeline",
    title: "Pro Prospect Pipeline — SC Expansion",
    category: "Prospecting & Enrichment",
    question:
      "Which SC construction/remodeling companies should we target for the Pro tile-system expansion, and who do we call?",
    definition:
      "213 SC construction/remodeling companies and 369 named decision-makers, ranked by a transparent fit score (revenue band + tile/remodel keyword fit + decision-maker seniority + reachability) and grouped by SC-expansion territory (Columbia, Florence, Sumter, …). Expand any company for firmographics and contacts with LinkedIn.",
    grain: "Company × decision-maker contact",
    dataSource: "LIVE — prospect_companies + prospect_contacts (Supabase), from the Landbase SC export.",
    status: "live",
    sourceId: landbaseScProspects.id,
    sourceExcerpt: "Integrate the prospect list",
    liveRoute: "/prospects",
  },
  {
    id: "customer-enrichment-candidates",
    title: "Existing-Customer Enrichment Candidates",
    category: "Prospecting & Enrichment",
    question: "Which prospects are already our customers, and what firmographics/contacts can enrich those records?",
    definition:
      "Prospects whose normalized name prefix-matches an existing (truncated) customer name, surfaced with the matched customer and a strong/possible confidence. Non-destructive — nothing writes back to customer records automatically; it's a reviewable candidate list.",
    grain: "Matched company",
    dataSource: "LIVE — prospect_companies.matched_customer_id join to customers (Supabase).",
    status: "live",
    sourceId: landbaseScProspects.id,
    sourceExcerpt: "Enrich existing customers",
    liveRoute: "/prospects",
    gap: "Auto-applying enrichment to customers is deferred by design — matches are prefix-based on truncated names and want a human check.",
  },
];

// ── Live analytics views already in the platform (the appendix of things we
//    actually look at). These predate Keith's note; listed so Reports is a
//    complete index, not just a wishlist. ────────────────────────────────────
export const liveViews: Report[] = [
  {
    id: "monthly-performance",
    title: "Monthly Performance vs Plan",
    category: "Reference — Live Views",
    question: "How is each month tracking against plan on Revenue, EBITDA, FCF, and Cash?",
    definition:
      "Monthly plan-vs-actual grid for Revenue, EBITDA, Free Cash Flow, and Cash Balance — the investor-facing performance update.",
    grain: "Metric × month, plan vs actual",
    dataSource: "LIVE — monthly_performance, forecast (Supabase).",
    status: "live",
    liveRoute: "/summary",
  },
  {
    id: "forecast-pnl",
    title: "Forecast P&L / Opex GL",
    category: "Reference — Live Views",
    question: "What is the multi-year P&L forecast and GL-level opex build?",
    definition: "Forecast P&L lines, opex by GL category, debt schedule, and the revenue matrix.",
    grain: "P&L line / GL category × year × scenario",
    dataSource: "LIVE — forecast_pnl, forecast_opex_gl, debt_schedule, revenue_matrix (Supabase).",
    status: "live",
    liveRoute: "/forecast",
  },
  {
    id: "customer-crm",
    title: "Customer CRM — annual & lifetime sales",
    category: "Reference — Live Views",
    question: "Who are our customers and what are their annual and lifetime sales and balances?",
    definition: "Customer list with lifetime + annual sales, payment history, balance, and segment; drill-through to an AR ledger per customer.",
    grain: "Customer × year",
    dataSource: "LIVE — customers, customer_annual_sales, ar_transactions (Supabase).",
    status: "live",
    liveRoute: "/customers",
  },
  {
    id: "ar-aging",
    title: "AR Aging by Customer",
    category: "Reference — Live Views",
    question: "How much are we owed, by customer, and how fast do they pay?",
    definition: "Per-customer AR aging rollup — invoice count, total invoiced, and average days-to-pay, de-duplicated per invoice number.",
    grain: "Customer (aged)",
    dataSource: "LIVE — get_ar_aging_by_customer() RPC over ar_transactions.",
    status: "live",
    liveRoute: "/customers",
  },
  {
    id: "delivery-plan",
    title: "Delivery Plan",
    category: "Reference — Live Views",
    question: "What are the execution milestones and their status?",
    definition: "Editable delivery-task grid by year, owner, system, and status.",
    grain: "Task",
    dataSource: "LIVE — delivery_tasks (Supabase).",
    status: "live",
    liveRoute: "/delivery",
  },
  {
    id: "hr-roster",
    title: "HR & Payroll Roster",
    category: "Reference — Live Views",
    question: "What is the current and post-transition staffing plan and pay?",
    definition: "Current + post-transition roster with pay plans and retain/transition disposition.",
    grain: "Employee",
    dataSource: "LIVE — hr_employees, hr_employee_plan_details (Supabase).",
    status: "live",
    liveRoute: "/hr",
  },
  {
    id: "marketing-growth",
    title: "Marketing & Growth Initiatives",
    category: "Reference — Live Views",
    question: "What growth levers are in flight and what revenue impact do they target?",
    definition: "Growth initiatives by category with target revenue impact and status.",
    grain: "Initiative",
    dataSource: "LIVE — growth_initiatives (Supabase).",
    status: "live",
    liveRoute: "/marketing",
  },
  {
    id: "schema-erd",
    title: "Schema ERD",
    category: "Reference — Live Views",
    question: "What tables and relationships exist in the live database?",
    definition: "Live information_schema introspection into a table/column/relationship map.",
    grain: "Schema object",
    dataSource: "LIVE — get_schema_erd() RPC.",
    status: "live",
    liveRoute: "/erd",
  },
  {
    id: "sql-console",
    title: "Read-Only SQL Console",
    category: "Reference — Live Views",
    question: "Ad-hoc: run a read-only query against live data.",
    definition: "Engine-level read-only single-SELECT runner (5s timeout, 500-row cap) with the ERD alongside.",
    grain: "Ad-hoc",
    dataSource: "LIVE — run_readonly_query() RPC.",
    status: "live",
    liveRoute: "/sql",
  },
];

export const ALL_REPORTS: Report[] = [...requestedReports, ...prospectingReports, ...liveViews];

export const REPORT_STATUS_META: Record<
  ReportStatus,
  { label: string; badgeClass: string; blurb: string }
> = {
  live: {
    label: "Live",
    badgeClass: "bg-accent-green/10 text-accent-green border-accent-green/20",
    blurb: "Backed by real data and surfaced in the platform today.",
  },
  spec: {
    label: "Spec — data pending",
    badgeClass: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    blurb: "Fully defined; awaiting the source data noted below before it can compute.",
  },
  planned: {
    label: "Planned",
    badgeClass: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
    blurb: "Composes/derives from other reports; built once they carry real numbers.",
  },
};

/** Category order for rendering. */
export const REPORT_CATEGORY_ORDER = [
  "Margin & Mix",
  "Customer",
  "P&L",
  "People",
  "Pricing",
  "Operating Cadence",
  "Prospecting & Enrichment",
  "Reference — Live Views",
];

export function reportsByCategory(): { category: string; reports: Report[] }[] {
  const groups = new Map<string, Report[]>();
  for (const r of ALL_REPORTS) {
    if (!groups.has(r.category)) groups.set(r.category, []);
    groups.get(r.category)!.push(r);
  }
  return REPORT_CATEGORY_ORDER.filter((c) => groups.has(c)).map((category) => ({
    category,
    reports: groups.get(category)!,
  }));
}

export function reportCounts() {
  return {
    total: ALL_REPORTS.length,
    live: ALL_REPORTS.filter((r) => r.status === "live").length,
    spec: ALL_REPORTS.filter((r) => r.status === "spec").length,
    planned: ALL_REPORTS.filter((r) => r.status === "planned").length,
  };
}
