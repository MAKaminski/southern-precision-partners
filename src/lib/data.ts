// ─── KPI Stats ───────────────────────────────────────────────────────────────
export interface KPIStat {
  label: string;
  value: string;
}

export const kpiStats: KPIStat[] = [
  { label: "LTM Revenue", value: "$4.95M" },
  { label: "LTM EBITDA", value: "$554K" },
  { label: "EBITDA Margin", value: "11.2%" },
  { label: "Entry Multiple", value: "4.5×" },
  { label: "Enterprise Value", value: "$2.49M" },
  { label: "Gross Margin", value: "42.5%" },
];

// ─── Cap Stack ───────────────────────────────────────────────────────────────
export interface CapStackTranche {
  name: string;
  amount: number;
  pct: number;
  terms: string;
  color: string;
}

// Sources: SBA term loan (Live Oak Bank) + Managing Partner equity + Seller
// financing — 80%/10%/10% of the $2.8M purchase price. Junior Partner is
// NOT a cash source (confirmed 2026-07-20: JP invests no cash — equity
// vests over the hold, see jpVestingSchedule below) — removed from Sources.
export const capStack: CapStackTranche[] = [
  { name: "SBA Term Loan (Live Oak Bank)", amount: 2_240_000, pct: 80, terms: "10%, 15-yr term, acquisition financing", color: "#2563EB" },
  { name: "Managing Partner Equity (Keith Piper)", amount: 280_000, pct: 10, terms: "10% of purchase price", color: "#059669" },
  { name: "Seller Note", amount: 280_000, pct: 10, terms: "10% seller financing", color: "#D97706" },
];

export const totalRaise = 2_800_000;

export interface UseOfFunds {
  label: string;
  amount: number;
}

export const usesOfFunds: UseOfFunds[] = [
  { label: "Business Acquisition", amount: 2_800_000 },
];

// ─── Investor Returns ────────────────────────────────────────────────────────
export interface InvestorReturn {
  title: string;
  invested: string;
  structure: string;
  proceeds: string;
  moic: string;
  irr: string;
  color: string;
}

// Figures below are 5-year cumulative operating distributions only (per the
// confirmed rule: each year, distribute the lesser of 1/3 Net Income or FCF;
// JP gets that pool × their vested equity %, GP gets the remainder — see
// cashFlowProjections). They exclude exit proceeds, which need a separate
// exit-valuation model against the new SBA-based capital structure — not
// fabricated here. MOIC/IRR are intentionally omitted until that exists.
export const investorReturns: InvestorReturn[] = [
  {
    title: "Managing Partner — Keith Piper (Equity)",
    invested: "$280K",
    structure: "Receives distributable pool remainder after JP's vested share",
    proceeds: "$1.64M",
    moic: "Pending exit model",
    irr: "Pending exit model",
    color: "#059669",
  },
  {
    title: "Junior Partner (Equity Vesting)",
    invested: "$0 (no cash — vesting equity)",
    structure: "0% → 20% equity vesting over 5 yrs, tied to value creation",
    proceeds: "$298K",
    moic: "Pending exit model",
    irr: "Pending exit model",
    color: "#7C3AED",
  },
];

// ─── Value Creation Phases ───────────────────────────────────────────────────
export interface Initiative {
  name: string;
  description: string;
  revenueImpact?: string;
  ebitdaImpact: string;
  phase: number;
  firstYear: number;
}

export interface Phase {
  number: number;
  title: string;
  years: string;
  color: string;
  initiatives: Initiative[];
}

export const phases: Phase[] = [
  {
    number: 1,
    title: "Financial Engineering",
    years: "Year 1",
    color: "#2563EB",
    initiatives: [
      { name: "SCF Integration", description: "2% vendor discount via supply chain finance", ebitdaImpact: "+$59.5K", phase: 1, firstYear: 2026 },
      { name: "Direct COGS Audit", description: "1.5% rebate from vendor renegotiation", ebitdaImpact: "+$44.6K", phase: 1, firstYear: 2026 },
      { name: "A/R Factoring", description: "Eliminates bad debt risk", ebitdaImpact: "Risk mitigation", phase: 1, firstYear: 2026 },
      { name: "Marketing Launch", description: "Geo-fenced SEM campaign", revenueImpact: "+$150K", ebitdaImpact: "+$25K", phase: 1, firstYear: 2026 },
      { name: "Real Estate Acquisition", description: "Acquire property ($1M), cancel $1,666/mo lease", ebitdaImpact: "+$20K", phase: 1, firstYear: 2026 },
    ],
  },
  {
    number: 2,
    title: "Revenue Acceleration",
    years: "Years 2–3",
    color: "#059669",
    initiatives: [
      { name: "Commercial Sales / Project Financing", description: "90-day float for builders", revenueImpact: "+$450K", ebitdaImpact: "+$90K", phase: 2, firstYear: 2027 },
      { name: "Digital / 3D Visualizer", description: "E-commerce + 3D design tool", revenueImpact: "+$200K", ebitdaImpact: "+$40K", phase: 2, firstYear: 2027 },
      { name: "Inventory Velocity", description: "Bulk purchasing & inventory optimization", ebitdaImpact: "+$15K", phase: 2, firstYear: 2027 },
      { name: "Commission Re-alignment", description: "Performance-based comp structure", ebitdaImpact: "+$20K", phase: 2, firstYear: 2027 },
    ],
  },
  {
    number: 3,
    title: "Scale & Exit Prep",
    years: "Years 4–5",
    color: "#D97706",
    initiatives: [
      { name: "Delivery Profit Center", description: "Tiered fees, leased truck", revenueImpact: "+$80K", ebitdaImpact: "+$35K", phase: 3, firstYear: 2029 },
      { name: "Geographic Expansion", description: "Location 3 buildout", revenueImpact: "+$400K", ebitdaImpact: "+$60K", phase: 3, firstYear: 2029 },
      { name: "Lean Ops / Central Fulfillment", description: "Operational efficiency program", ebitdaImpact: "+$15K", phase: 3, firstYear: 2029 },
    ],
  },
];

// ─── Key Risks ───────────────────────────────────────────────────────────────
export const keyRisks: string[] = [
  "Execution risk: multiple simultaneous initiatives require focused management bandwidth",
  "Builder market cyclicality: commercial sales growth assumes sustained Georgia construction demand",
  "Debt service: $2.7M total debt at entry; model requires >$300K/yr free cash flow to service",
];

// ─── EBITDA Bridge (Baseline → Normalized → Year 1 Pro-Forma) ────────────────
export const ebitdaBridgeNormalization = {
  baselineEbitda: 334_000,
  rentReclamation: 90_000,
  florenceOptimization: 28_000,
  normalizedDay1: 452_000,
  scfFloat: 56_800,
  cogsReduction: 45_200,
  year1ProForma: 554_000,
};

// ─── 5-Year Plan (Post-Close) ────────────────────────────────────────────────
// Source: "Mosaic" planning sheet (Google Drive, Business Plan tab), confirmed
// against the live deal 2026-07-20. Replaces the old 5%-organic model, which
// didn't tie to the real plan. Year 0 = 2026 entry/closing basis (current
// run-rate at acquisition, target close Q3 2026); Years 1-5 = 2027-2031 hold
// period, ending at ~$17.2M revenue / ~$3.1M EBITDA.
//
// AUDIT-FOLLOWUP: this is the aggregate plan (organic growth + all initiatives
// combined) — splitting it into an "organic baseline" vs. "initiative impact"
// track, and building a per-year EBITDA bridge tied to these EOY numbers, is
// a deliberate next step, not done here. See ROADMAP.md.
export interface FinancialYear {
  year: string;
  label: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
}

export const entryBasis: FinancialYear = {
  year: "2026E",
  label: "Entry (Yr 0)",
  revenue: 4_679_751,
  ebitda: 380_260,
  ebitdaMargin: 8.1,
};

export const financialYears: FinancialYear[] = [
  { year: "2027E", label: "Yr 1", revenue: 5_500_000, ebitda: 495_000, ebitdaMargin: 9.0 },
  { year: "2028E", label: "Yr 2", revenue: 7_425_000, ebitda: 891_000, ebitdaMargin: 12.0 },
  { year: "2029E", label: "Yr 3", revenue: 10_395_000, ebitda: 1_455_300, ebitdaMargin: 14.0 },
  { year: "2030E", label: "Yr 4", revenue: 14_033_250, ebitda: 2_315_486, ebitdaMargin: 16.5 },
  { year: "2031E", label: "Yr 5", revenue: 17_190_730, ebitda: 3_094_331, ebitdaMargin: 18.0 },
];

// ─── Junior Partner Equity Vesting ────────────────────────────────────────────
// JP equity vests 0% -> 20% over the hold as the company creates value — no
// upfront cash investment (confirmed 2026-07-20; corrects the prior $100K
// cash-investment assumption, which was wrong).
export interface JPVestingYear {
  year: string;
  jpEquityPct: number;
  jpEquityValue: number;
}

export const jpVestingSchedule: JPVestingYear[] = [
  { year: "Yr 1", jpEquityPct: 4, jpEquityValue: 153_142 },
  { year: "Yr 2", jpEquityPct: 8, jpEquityValue: 456_427 },
  { year: "Yr 3", jpEquityPct: 12, jpEquityValue: 969_111 },
  { year: "Yr 4", jpEquityPct: 16, jpEquityValue: 2_125_368 },
  { year: "Yr 5", jpEquityPct: 20, jpEquityValue: 4_498_418 },
];

// ─── Cash Flow Projections & Distributions ───────────────────────────────────
// Debt service and Net Income/FCF per the Mosaic sheet's Financing Schedule +
// P&L (SBA Term Loan + Seller Note — the confirmed capital structure).
//
// Distribution rule (confirmed 2026-07-20): each year, distribute the LESSER
// of 1/3 of Net Income or Free Cash Flow ("distributablePool"); JP receives
// that pool times their vested equity % for the year ("jpDistribution"); GP
// receives the remainder ("gpDistribution").
export interface CashFlowYear {
  year: string;
  sales: number;
  ebitda: number;
  ebitdaPct: number;
  sbaInterest: number;
  sbaPrincipal: number;
  sellerNoteInterest: number;
  sellerNotePrincipal: number;
  capex: number;
  taxes: number;
  netIncome: number;
  freeCashFlow: number;
  distributablePool: number;
  jpEquityPct: number;
  gpDistribution: number;
  jpDistribution: number;
}

export const cashFlowProjections: CashFlowYear[] = [
  { year: "Yr 1", sales: 5_500_000, ebitda: 495_000, ebitdaPct: 9.0, sbaInterest: -64_854, sbaPrincipal: -224_000, sellerNoteInterest: -28_000, sellerNotePrincipal: -67_046, capex: -30_000, taxes: -102_547, netIncome: 299_599, freeCashFlow: 269_599, distributablePool: 99_866, jpEquityPct: 4, gpDistribution: 95_871, jpDistribution: 3_995 },
  { year: "Yr 2", sales: 7_425_000, ebitda: 891_000, ebitdaPct: 12.0, sbaInterest: -64_854, sbaPrincipal: -224_000, sellerNoteInterest: -28_000, sellerNotePrincipal: -67_046, capex: -30_000, taxes: -203_527, netIncome: 594_619, freeCashFlow: 564_619, distributablePool: 198_206, jpEquityPct: 8, gpDistribution: 182_350, jpDistribution: 15_856 },
  { year: "Yr 3", sales: 10_395_000, ebitda: 1_455_300, ebitdaPct: 14.0, sbaInterest: -64_854, sbaPrincipal: -224_000, sellerNoteInterest: -28_000, sellerNotePrincipal: -67_046, capex: -30_000, taxes: -347_424, netIncome: 1_015_022, freeCashFlow: 985_022, distributablePool: 338_341, jpEquityPct: 12, gpDistribution: 297_740, jpDistribution: 40_601 },
  { year: "Yr 4", sales: 14_033_250, ebitda: 2_315_486, ebitdaPct: 16.5, sbaInterest: -64_854, sbaPrincipal: -224_000, sellerNoteInterest: -28_000, sellerNotePrincipal: -67_046, capex: -30_000, taxes: -566_771, netIncome: 1_655_861, freeCashFlow: 1_625_861, distributablePool: 551_954, jpEquityPct: 16, gpDistribution: 463_641, jpDistribution: 88_313 },
  { year: "Yr 5", sales: 17_190_730, ebitda: 3_094_331, ebitdaPct: 18.0, sbaInterest: -64_854, sbaPrincipal: -224_000, sellerNoteInterest: -28_000, sellerNotePrincipal: -67_046, capex: -30_000, taxes: -765_377, netIncome: 2_236_100, freeCashFlow: 2_206_100, distributablePool: 745_367, jpEquityPct: 20, gpDistribution: 596_294, jpDistribution: 149_073 },
];

export const incomeStatementYears = ["Yr 1", "Yr 2", "Yr 3", "Yr 4", "Yr 5"];

// ─── Debt Facilities ─────────────────────────────────────────────────────────
export interface DebtFacility {
  name: string;
  lender: string;
  amount: string;
  rate: string;
  structure: string;
  maturity: string;
  recourse: string;
}

export const debtFacilities: DebtFacility[] = [
  { name: "SBA Term Loan", lender: "Live Oak Bank", amount: "$2.24M", rate: "10%", structure: "15-yr term, amortizing", maturity: "2041", recourse: "SBA-guaranteed" },
  { name: "SBA Working Capital LOC", lender: "Live Oak Bank", amount: "$250K revolving", rate: "TBD", structure: "Revolving", maturity: "Ongoing", recourse: "SBA-guaranteed" },
  { name: "Seller Note", lender: "Seller", amount: "$280K", rate: "10%", structure: "Term TBD", maturity: "TBD", recourse: "Non-recourse" },
  { name: "SCF Facility", lender: "TBD", amount: "$700K revolving", rate: "3.5%", structure: "Revolving", maturity: "Ongoing", recourse: "Non-recourse" },
  { name: "A/R Factoring", lender: "TBD", amount: "$400K revolving", rate: "3.0%", structure: "Revolving", maturity: "Ongoing", recourse: "Non-recourse" },
];

// AUDIT-FOLLOWUP: this single cumulative bridge still targets the old ~$1.3M
// Year-5 EBITDA plan (Baseline $334K), not the new $3.09M Year-5 EBITDA from
// the real 5-year plan above. Item 5 of the 2026-07-20 direction asks for a
// per-year bridge (organic vs. initiative, tied to real EOY EBITDA each year)
// plus a schedule per initiative — that's a deliberate follow-up rebuild, not
// done here. Tracked in ROADMAP.md.
// ─── EBITDA Bridge ───────────────────────────────────────────────────────────
export interface BridgeItem {
  name: string;
  value: number;
  isBase?: boolean;
  isTotal?: boolean;
}

export const ebitdaBridge: BridgeItem[] = [
  { name: "Baseline EBITDA", value: 334_000, isBase: true },
  { name: "Rent Reclamation", value: 90_000 },
  { name: "Florence Optimization", value: 28_000 },
  { name: "SCF Float (2%)", value: 56_800 },
  { name: "COGS Reduction (1.5%)", value: 45_200 },
  { name: "Phase 1 Initiatives", value: 129_100 },
  { name: "Phase 2 Initiatives", value: 165_000 },
  { name: "Phase 3 Initiatives", value: 110_000 },
];

// AUDIT-FOLLOWUP: sensitivity/IRR matrices below and the base-case anchor
// still assume the old $9M exit EV / $3.1M raise. Needs a rebuild against the
// new SBA-based structure and real revenue plan once an exit-valuation model
// is defined. Tracked in ROADMAP.md.
// ─── Sensitivity Matrix (MOIC) ──────────────────────────────────────────────
export const sensitivityRevenueLabels = ["-40%", "-30%", "-20%", "-10%", "Base", "+10%"];

export const sensitivityExitMultiples = ["4×", "4.5×", "5×", "5.5×", "6×", "6.5×", "7×", "7.5×"];

export const sensitivityMoicMatrix: number[][] = [
  [2.40, 2.78, 3.17, 3.55, 3.93, 4.32],
  [2.69, 3.12, 3.55, 3.98, 4.41, 4.84],
  [2.97, 3.45, 3.93, 4.41, 4.89, 5.37],
  [3.26, 3.79, 4.32, 4.84, 5.37, 5.90],
  [3.55, 4.12, 4.70, 5.27, 5.85, 6.42],
  [3.84, 4.46, 5.08, 5.70, 6.33, 6.95],
  [4.12, 4.79, 5.47, 6.14, 6.81, 7.48],
  [4.41, 5.13, 5.85, 6.57, 7.29, 8.00],
];

// base case is row 4 (6×), col 4 (Base) => sensitivityMoicMatrix[4][4] = 5.85
export const sensitivityBaseRow = 4;
export const sensitivityBaseCol = 4;

// ─── IRR Sensitivity ─────────────────────────────────────────────────────────
export const irrHoldPeriods = ["3 Years", "4 Years", "5 Years", "6 Years", "7 Years"];
export const irrExitMultiples = ["4×", "5×", "6×", "7×", "8×"];

export const irrMatrix: number[][] = [
  [55.1, 39.9, 31.5, 26.2, 22.5],
  [67.4, 47.9, 37.4, 30.7, 26.2],
  [78.1, 54.8, 42.4, 34.6, 29.3],
  [87.6, 60.9, 46.8, 38.0, 32.1],
  [96.3, 66.4, 50.7, 41.0, 34.5],
];

// ─── Lender Comparisons ─────────────────────────────────────────────────────
export interface SCFLender {
  name: string;
  url: string;
  type: string;
  facilityFit: string;
  rate: string;
  approval: string;
  meetsTarget: string;
}

export const scfLenders: SCFLender[] = [
  { name: "eCapital", url: "https://www.ecapital.com", type: "Reverse Factoring / SCF", facilityFit: "✓ $400K–$1M", rate: "3.0–4.0%", approval: "HIGH ✓", meetsTarget: "✓ YES at 3.0–3.5%" },
  { name: "Riviera Finance", url: "https://www.rivierafinance.com", type: "Invoice Factoring", facilityFit: "✓ $200K–$2M", rate: "1–3% per 30d", approval: "HIGH ✓", meetsTarget: "⚠ MAYBE (tenor-dependent)" },
  { name: "Triumph Business Capital", url: "https://www.triumphbusinesscapital.com", type: "Invoice Factoring / SCF", facilityFit: "✓ $500K–$5M", rate: "2.5–4.5%", approval: "HIGH ✓", meetsTarget: "⚠ Check rate" },
  { name: "Resolve Pay", url: "https://www.resolvepay.com", type: "B2B BNPL", facilityFit: "⚠ <$500K", rate: "2.61–3.5% flat", approval: "HIGH ✓", meetsTarget: "✓ YES" },
  { name: "C2FO", url: "https://www.c2fo.com", type: "Dynamic Discounting", facilityFit: "N/A — per invoice", rate: "2% annualized", approval: "MEDIUM", meetsTarget: "✓ If large buyers exist" },
];

export interface ARLender {
  name: string;
  url: string;
  type: string;
  rate: string;
  approval: string;
  meetsTarget: string;
}

export const arLenders: ARLender[] = [
  { name: "eCapital", url: "https://www.ecapital.com", type: "Non-Recourse A/R", rate: "2.5–4.0% / 30d", approval: "HIGH ✓", meetsTarget: "✓ YES at volume" },
  { name: "Riviera Finance", url: "https://www.rivierafinance.com", type: "Non-Recourse A/R", rate: "1–3% / 30d", approval: "HIGH ✓", meetsTarget: "✓ YES" },
  { name: "Triumph Business Capital", url: "https://www.triumphbusinesscapital.com", type: "Non-Recourse A/R", rate: "1.5–3.5%", approval: "HIGH ✓", meetsTarget: "✓ YES likely" },
  { name: "Bluevine", url: "https://www.bluevine.com", type: "Invoice Factoring", rate: "0.25–1.7%/week", approval: "HIGH ✓", meetsTarget: "✗ NO (APR too high)" },
];

// ─── 90-Day Float Steps ──────────────────────────────────────────────────────
export interface FloatStep {
  day: string;
  description: string;
}

export const floatSteps: FloatStep[] = [
  { day: "Day 1", description: "Tile ordered from vendor" },
  { day: "Day 10", description: "Intermediary pays vendor ($49K on $50K invoice; Mosaic captures 2% discount)" },
  { day: "Day 15", description: "Tile delivered to builder; Net-60 invoice issued" },
  { day: "Day 75", description: "Builder pays $50K (project draw received)" },
  { day: "Day 90", description: "Mosaic repays intermediary $49K + ~$500 fee" },
];

// ─── Cost of Acceptance by Channel ───────────────────────────────────────────
// Proxy model for merchant payment-acceptance cost at Tile Center Group.
// A ~$5M B2B tile/stone distributor collects across cash, check/ACH, and cards.
// Cards carry an "effective rate" = interchange + assessments + processor markup;
// cash/check/ACH carry a small handling/deposit/float proxy. All defaults are
// planning estimates to be refreshed with the target's actual processor statements.
export interface AcceptanceChannel {
  channel: string;
  category: "Cash & Bank" | "Debit" | "Credit";
  mixPct: number; // share of total collected $ that arrives via this channel
  feeRate: number; // effective cost of acceptance, % of $ processed
  color: string;
  note: string;
}

// Default annual collected volume ≈ LTM revenue.
export const acceptanceRevenueDefault = 4_950_000;

export const acceptanceChannels: AcceptanceChannel[] = [
  { channel: "Cash", category: "Cash & Bank", mixPct: 8, feeRate: 0.20, color: "#059669", note: "Deposit handling, shrink & armored-car proxy" },
  { channel: "Check", category: "Cash & Bank", mixPct: 22, feeRate: 0.10, color: "#10B981", note: "Remote deposit + occasional NSF/bad-debt proxy" },
  { channel: "ACH / Wire", category: "Cash & Bank", mixPct: 15, feeRate: 0.15, color: "#34D399", note: "Flat per-item fee amortized over B2B ticket size" },
  { channel: "Debit", category: "Debit", mixPct: 5, feeRate: 0.80, color: "#0EA5E9", note: "Regulated + unregulated blend, PIN/signature" },
  { channel: "Visa Credit", category: "Credit", mixPct: 22, feeRate: 2.30, color: "#2563EB", note: "Interchange + assessments + markup; commercial-heavy" },
  { channel: "Mastercard Credit", category: "Credit", mixPct: 15, feeRate: 2.35, color: "#7C3AED", note: "Interchange + assessments + markup; commercial-heavy" },
  { channel: "Amex", category: "Credit", mixPct: 8, feeRate: 3.30, color: "#D97706", note: "OptBlue / direct; highest discount rate" },
  { channel: "Discover", category: "Credit", mixPct: 5, feeRate: 2.40, color: "#DC2626", note: "Interchange + assessments + markup" },
];

// Cost-out levers. Each applies a % reduction to the acceptance cost of the
// channels it targets. Enabled levers stack multiplicatively on a channel's
// remaining cost so combined reductions never exceed 100%. Operational levers
// default ON; strategic pricing levers (ACH steering, surcharging) default OFF
// and are surfaced as incremental upside.
export interface CostOutLever {
  id: string;
  name: string;
  description: string;
  targetChannels: string[];
  reductionPct: number;
  enabledByDefault: boolean;
  strategic?: boolean;
}

export const acceptanceCostOutLevers: CostOutLever[] = [
  {
    id: "interchange-plus",
    name: "Interchange-plus repricing",
    description: "Move off bundled/tiered pricing to interchange-plus and compete the processor markup down.",
    targetChannels: ["Debit", "Visa Credit", "Mastercard Credit", "Amex", "Discover"],
    reductionPct: 12,
    enabledByDefault: true,
  },
  {
    id: "level-2-3",
    name: "Level 2 / Level 3 B2B data",
    description: "Pass tax, invoice & line-item data on commercial cards to qualify for lower B2B interchange.",
    targetChannels: ["Visa Credit", "Mastercard Credit"],
    reductionPct: 18,
    enabledByDefault: true,
  },
  {
    id: "amex-optblue",
    name: "Amex OptBlue / steering",
    description: "Reprice Amex under OptBlue and steer large Amex spenders toward lower-cost tender.",
    targetChannels: ["Amex"],
    reductionPct: 25,
    enabledByDefault: true,
  },
  {
    id: "ach-steering",
    name: "ACH steering for house accounts",
    description: "Migrate a portion of large recurring card volume to ACH via terms & incentives.",
    targetChannels: ["Visa Credit", "Mastercard Credit", "Amex", "Discover"],
    reductionPct: 20,
    enabledByDefault: false,
    strategic: true,
  },
  {
    id: "surcharge",
    name: "Surcharge / cash-discount program",
    description: "Compliantly pass credit-card fees to the buyer (GA permits up to 3%). Debit is exempt.",
    targetChannels: ["Visa Credit", "Mastercard Credit", "Discover"],
    reductionPct: 85,
    enabledByDefault: false,
    strategic: true,
  },
];

// EBITDA baseline that acceptance savings drop straight through to.
export const acceptanceBaseEbitda = 553_920;

// ─── SEP Partners Contact Info ───────────────────────────────────────────────
export const contactInfo = {
  name: "Keith Piper",
  title: "Managing Partner",
  company: "Southeast Precision Partners",
  companyShort: "SEP",
  email: "deals@sep-partners.com",
  phone: "(404) 555-0120",
  website: "www.sep-partners.com",
  address: "Atlanta, GA",
};
