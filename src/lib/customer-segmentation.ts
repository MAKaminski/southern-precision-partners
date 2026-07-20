import type { CustomerWithSales } from "@/lib/spp-queries";

// ─────────────────────────────────────────────────────────────────────────────
// Customer acquisition rubric — classifies the existing book of business
// (from `customers` / `customer_annual_sales`, the CRM) into B2B tiers and
// non-business purchase types. There's no legal-entity flag in the source
// ledger, so business vs. individual is inferred from the customer name and
// order-repeat behavior — a heuristic, not ground truth. It's documented
// here so it's auditable and adjustable, and every customer stays
// click-through-able to its real record for manual review.
// ─────────────────────────────────────────────────────────────────────────────

export type SegmentKey =
  | "excluded"
  | "b2b_tier1"
  | "b2b_tier2"
  | "b2b_tier3"
  | "individual_single"
  | "individual_repeat";

export interface SegmentDef {
  key: SegmentKey;
  label: string;
  description: string;
}

export const SEGMENT_DEFS: SegmentDef[] = [
  {
    key: "b2b_tier1",
    label: "B2B Tier 1 — Key Accounts",
    description: "Avg. annual spend ≥ $25,000, or 40+ lifetime orders.",
  },
  {
    key: "b2b_tier2",
    label: "B2B Tier 2 — Core Accounts",
    description: "Avg. annual spend $7,500–$24,999, or 10–39 lifetime orders.",
  },
  {
    key: "b2b_tier3",
    label: "B2B Tier 3 — Growth Accounts",
    description: "Avg. annual spend under $7,500 and fewer than 10 lifetime orders.",
  },
  {
    key: "individual_repeat",
    label: "Non-Business — Repeat Buyer",
    description: "No business-name signal, 2+ lifetime orders.",
  },
  {
    key: "individual_single",
    label: "Non-Business — One-Time Buyer",
    description: "No business-name signal, exactly 1 lifetime order.",
  },
];

// A name containing "CASH" is a point-of-sale cash-transaction bucket, not a
// distinct customer (e.g. "COLUMBIA CASH TRANSACTIONS"). Zero lifetime sales
// with an implausibly high order count is the same kind of aggregate/ledger
// artifact under a different label (e.g. "HORTON TAMMY", 1203 rows, $0).
const EXCLUDE_PATTERN = /cash/i;
const EXCLUDE_ZERO_SALES_ORDER_THRESHOLD = 50;

/** True when a customer record is a point-of-sale/aggregate bucket, not a distinct real customer. */
export function isExcludedAggregate(c: { name: string; lifetime_sales: number; lifetime_sale_count: number }): boolean {
  const sales = Number(c.lifetime_sales) || 0;
  const orders = Number(c.lifetime_sale_count) || 0;
  return EXCLUDE_PATTERN.test(c.name) || (sales === 0 && orders >= EXCLUDE_ZERO_SALES_ORDER_THRESHOLD);
}

// Business-name signal: common entity suffixes and trade-industry words seen
// throughout this ledger (contractors, tile/flooring shops, builders, etc.).
// Names are truncated to ~15-16 chars in the source export, so this matches
// anywhere in the string, not just as a suffix.
const BUSINESS_KEYWORD_PATTERN =
  /(LLC|INC|CORP|COMPANY|GROUP|GRP|ENTERPRISE|BUILDER|BUILDING|BUILD|CONSTRUCT|CONTRACT|DESIGN|TILE|FLOOR|CARPET|HOME|REMODEL|RENOVAT|PROPERT|DEVELOP|SERVICE|SUPPLY|ROOFING|ROOF|PAINT|CABINET|GRANITE|MARBLE|STONE|INTERIOR|KITCHEN|POOL|GLASS|PEST|EXTERMIN|CENTER|ASSOC|PARTNER|STUDIO|SHOP|INTERNATIONAL|DEPT|RESID|CUSTOM|SPECIAL|CRAFT|DECOR|EXTERIOR|STRUCT)/i;

// 3+ separate orders reads as an ongoing trade relationship even without a
// company-style name (very common for sole-proprietor contractors in this
// book), so it counts as a business signal on its own.
const REPEAT_ORDER_BUSINESS_THRESHOLD = 3;

const TIER1_MIN_AVG_ANNUAL_SPEND = 25_000;
const TIER1_MIN_ORDERS = 40;
const TIER2_MIN_AVG_ANNUAL_SPEND = 7_500;
const TIER2_MIN_ORDERS = 10;

export interface ClassifiedCustomer {
  customer: CustomerWithSales;
  segment: SegmentKey;
  avgAnnualSpend: number;
  yearsActive: number;
}

export function avgAnnualSpend(c: CustomerWithSales): { avg: number; years: number } {
  const years = Object.keys(c.annual).length || 1;
  return { avg: Number(c.lifetime_sales) / years, years };
}

export function classifyCustomer(c: CustomerWithSales): ClassifiedCustomer {
  const { avg, years } = avgAnnualSpend(c);
  const orders = Number(c.lifetime_sale_count) || 0;

  if (isExcludedAggregate(c)) {
    return { customer: c, segment: "excluded", avgAnnualSpend: avg, yearsActive: years };
  }

  const isBusiness = BUSINESS_KEYWORD_PATTERN.test(c.name) || orders >= REPEAT_ORDER_BUSINESS_THRESHOLD;
  if (isBusiness) {
    let segment: SegmentKey = "b2b_tier3";
    if (avg >= TIER1_MIN_AVG_ANNUAL_SPEND || orders >= TIER1_MIN_ORDERS) segment = "b2b_tier1";
    else if (avg >= TIER2_MIN_AVG_ANNUAL_SPEND || orders >= TIER2_MIN_ORDERS) segment = "b2b_tier2";
    return { customer: c, segment, avgAnnualSpend: avg, yearsActive: years };
  }

  return {
    customer: c,
    segment: orders > 1 ? "individual_repeat" : "individual_single",
    avgAnnualSpend: avg,
    yearsActive: years,
  };
}

export function classifyCustomers(customers: CustomerWithSales[]): ClassifiedCustomer[] {
  return customers.map(classifyCustomer);
}
