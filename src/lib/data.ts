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

export const capStack: CapStackTranche[] = [
  { name: "LP Debt (Pete — Senior)", amount: 2_400_000, pct: 72.7, terms: "10% + 5% equity kicker, 5-yr bullet", color: "#2563EB" },
  { name: "Managing Partner Equity (Keith Piper)", amount: 300_000, pct: 9.1, terms: "80% ownership", color: "#059669" },
  { name: "Junior Partner Equity", amount: 300_000, pct: 9.1, terms: "15% ownership", color: "#7C3AED" },
  { name: "Seller Note", amount: 300_000, pct: 9.1, terms: "6%, 5-yr amort", color: "#D97706" },
];

export const totalRaise = 3_300_000;

export interface UseOfFunds {
  label: string;
  amount: number;
}

export const usesOfFunds: UseOfFunds[] = [
  { label: "Business Acquisition", amount: 2_490_000 },
  { label: "Real Estate", amount: 1_000_000 },
  { label: "Working Capital", amount: 200_000 },
  { label: "Fees", amount: 80_000 },
  { label: "MIP Reserve", amount: 50_000 },
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

export const investorReturns: InvestorReturn[] = [
  {
    title: "LP (Pete — Debt)",
    invested: "$2.4M",
    structure: "Bullet debt + 5% equity kicker",
    proceeds: "$3.51M",
    moic: "1.46×",
    irr: "6.2% (debt) + equity kicker upside",
    color: "#2563EB",
  },
  {
    title: "Managing Partner — Keith Piper (Equity)",
    invested: "$300K",
    structure: "80% ownership",
    proceeds: "$4.28M",
    moic: "14.3×",
    irr: "70%",
    color: "#059669",
  },
  {
    title: "Junior Partner (Equity)",
    invested: "$300K",
    structure: "15% ownership",
    proceeds: "$802K",
    moic: "2.67×",
    irr: "21.7%",
    color: "#7C3AED",
  },
];

// ─── Scenario Table (JP) ────────────────────────────────────────────────────
export interface Scenario {
  name: string;
  exitMultiple: string;
  jpMoic: string;
  jpIrr: string;
}

export const scenarios: Scenario[] = [
  { name: "Bear", exitMultiple: "4.5×", jpMoic: "2.02×", jpIrr: "15.1%" },
  { name: "Base", exitMultiple: "6.0×", jpMoic: "2.67×", jpIrr: "21.7%" },
  { name: "Bull", exitMultiple: "7.5×", jpMoic: "3.33×", jpIrr: "27.2%" },
  { name: "Stretch", exitMultiple: "9.0×", jpMoic: "3.99×", jpIrr: "31.9%" },
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

// ─── Financials — PRE-Initiative (Organic 5% Growth) ─────────────────────────
export interface FinancialYear {
  year: string;
  label: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
}

export const financialYearsPreInitiative: FinancialYear[] = [
  { year: "2026E", label: "Yr 1", revenue: 4_800_000, ebitda: 553_920, ebitdaMargin: 11.5 },
  { year: "2027E", label: "Yr 2", revenue: 5_040_000, ebitda: 624_960, ebitdaMargin: 12.4 },
  { year: "2028E", label: "Yr 3", revenue: 5_292_000, ebitda: 701_719, ebitdaMargin: 13.3 },
  { year: "2029E", label: "Yr 4", revenue: 5_556_600, ebitda: 785_148, ebitdaMargin: 14.1 },
  { year: "2030E", label: "Yr 5", revenue: 5_834_430, ebitda: 875_165, ebitdaMargin: 15.0 },
];

// ─── Financials — POST-Initiative (Organic + Growth Initiatives) ─────────────
export const financialYearsPostInitiative: FinancialYear[] = [
  { year: "2026E", label: "Yr 1", revenue: 4_950_000, ebitda: 683_100, ebitdaMargin: 13.8 },
  { year: "2027E", label: "Yr 2", revenue: 5_690_000, ebitda: 848_100, ebitdaMargin: 14.9 },
  { year: "2028E", label: "Yr 3", revenue: 5_942_000, ebitda: 848_100, ebitdaMargin: 14.3 },
  { year: "2029E", label: "Yr 4", revenue: 6_036_600, ebitda: 958_100, ebitdaMargin: 15.9 },
  { year: "2030E", label: "Yr 5", revenue: 6_314_430, ebitda: 958_100, ebitdaMargin: 15.2 },
];

// Combined for chart (used on summary page)
export const financialYears: FinancialYear[] = financialYearsPostInitiative;

// ─── Growth Initiative Phase Targets ─────────────────────────────────────────
export interface InitiativePhaseTarget {
  phase: string;
  years: string;
  salesImpact: number;
  ebitdaImpact: number;
  projectedEbitda: number;
  projectedMargin: number;
}

export const initiativePhaseTargets: InitiativePhaseTarget[] = [
  { phase: "Phase 1: Efficiency Engine", years: "Yr 1", salesImpact: 150_000, ebitdaImpact: 129_100, projectedEbitda: 683_100, projectedMargin: 13.8 },
  { phase: "Phase 2: Commercial & Digital", years: "Yr 2–3", salesImpact: 650_000, ebitdaImpact: 165_000, projectedEbitda: 848_100, projectedMargin: 14.5 },
  { phase: "Phase 3: Scale & Geo Expansion", years: "Yr 4–5", salesImpact: 480_000, ebitdaImpact: 110_000, projectedEbitda: 958_100, projectedMargin: 16.4 },
];

// ─── Scenario 1 — 10% LP Debt IO ────────────────────────────────────────────
export interface CashFlowYear {
  year: string;
  sales: number;
  ebitdaPct: number;
  ebitda: number;
  lpInterest: number;
  sellerNote: number;
  capitalReserve: number;
  taxes: number;
  distributableFCF: number;
  managingMember: number;
  juniorPartner: number;
  seniorLPEquity?: number;
}

export const scenario1CashFlows: CashFlowYear[] = [
  { year: "Yr 1", sales: 4_800_000, ebitdaPct: 11.5, ebitda: 553_920, lpInterest: -240_000, sellerNote: -69_600, capitalReserve: -55_000, taxes: -47_330, distributableFCF: 141_990, managingMember: 35_497, juniorPartner: 35_497 },
  { year: "Yr 2", sales: 5_040_000, ebitdaPct: 12.4, ebitda: 624_960, lpInterest: -240_000, sellerNote: -69_600, capitalReserve: -57_750, taxes: -64_403, distributableFCF: 193_207, managingMember: 48_302, juniorPartner: 48_302 },
  { year: "Yr 3", sales: 5_292_000, ebitdaPct: 13.3, ebitda: 701_719, lpInterest: -240_000, sellerNote: -69_600, capitalReserve: -60_638, taxes: -82_870, distributableFCF: 248_611, managingMember: 62_153, juniorPartner: 62_153 },
  { year: "Yr 4", sales: 5_556_600, ebitdaPct: 14.1, ebitda: 785_148, lpInterest: -240_000, sellerNote: -69_600, capitalReserve: -63_669, taxes: -102_970, distributableFCF: 308_909, managingMember: 77_227, juniorPartner: 77_227 },
  { year: "Yr 5", sales: 5_834_430, ebitdaPct: 15.0, ebitda: 875_165, lpInterest: -240_000, sellerNote: -69_600, capitalReserve: -66_853, taxes: -124_678, distributableFCF: 374_034, managingMember: 264_154, juniorPartner: 109_880 },
];

export const scenario1 = {
  name: "Scenario 1 — 10% LP Debt Only",
  lpRate: "10%",
  lpStructure: "IO, 60-month balloon",
  totalDeal: 3_000_000,
  lpPrincipal: 2_400_000,
  sellerNote: 300_000,
  exitEV: 9_000_000,
  lpCoverage: "2.30×",
};

// ─── Scenario 2 — 7% LP + 5% Equity Kicker ──────────────────────────────────
export const scenario2CashFlows: CashFlowYear[] = [
  { year: "Yr 1", sales: 4_800_000, ebitdaPct: 11.5, ebitda: 553_920, lpInterest: -168_000, sellerNote: -69_600, capitalReserve: -55_000, taxes: -65_330, distributableFCF: 195_990, managingMember: 48_998, juniorPartner: 48_998, seniorLPEquity: 0 },
  { year: "Yr 2", sales: 5_040_000, ebitdaPct: 12.4, ebitda: 624_960, lpInterest: -168_000, sellerNote: -69_600, capitalReserve: -57_750, taxes: -82_403, distributableFCF: 247_208, managingMember: 61_802, juniorPartner: 61_802, seniorLPEquity: 0 },
  { year: "Yr 3", sales: 5_292_000, ebitdaPct: 13.3, ebitda: 701_719, lpInterest: -168_000, sellerNote: -69_600, capitalReserve: -60_638, taxes: -100_870, distributableFCF: 302_611, managingMember: 75_653, juniorPartner: 75_653, seniorLPEquity: 0 },
  { year: "Yr 4", sales: 5_556_600, ebitdaPct: 14.1, ebitda: 785_148, lpInterest: -168_000, sellerNote: -69_600, capitalReserve: -63_669, taxes: -120_970, distributableFCF: 362_909, managingMember: 90_727, juniorPartner: 90_727, seniorLPEquity: 0 },
  { year: "Yr 5", sales: 5_834_430, ebitdaPct: 15.0, ebitda: 875_165, lpInterest: -168_000, sellerNote: -69_600, capitalReserve: -66_853, taxes: -142_678, distributableFCF: 428_034, managingMember: 328_735, juniorPartner: 80_180, seniorLPEquity: 19_120 },
];

export const scenario2 = {
  name: "Scenario 2 — 7% LP + 5% Equity Kicker",
  lpRate: "7%",
  lpStructure: "IO + 5% common equity, refi allowed after Mo 12",
  totalDeal: 3_000_000,
  lpPrincipal: 2_400_000,
  sellerNote: 300_000,
  exitEV: 9_000_000,
  postDebtEV: 6_600_000,
  lpCoverage: "3.29×",
  exitSplit: { seniorLP5pct: 330_000, juniorPartner15pct: 940_500, managingMember80pct: 5_330_000 },
};

// ─── Income Statement Line Items ─────────────────────────────────────────────
export interface IncomeStatementLine {
  label: string;
  isHeader?: boolean;
  values: (number | null)[];
}

// Pre-initiative (organic only) cash flow — Scenario 1 (10% IO)
export const incomeStatementPreInitiative: IncomeStatementLine[] = [
  { label: "Revenue", isHeader: true, values: [4_800_000, 5_040_000, 5_292_000, 5_556_600, 5_834_430] },
  { label: "EBITDA", isHeader: true, values: [553_920, 624_960, 701_719, 785_148, 875_165] },
  { label: "EBITDA Margin", values: [11.5, 12.4, 13.3, 14.1, 15.0] },
  { label: "LP Interest (10% IO)", values: [-240_000, -240_000, -240_000, -240_000, -240_000] },
  { label: "Seller Note (P&I)", values: [-69_600, -69_600, -69_600, -69_600, -69_600] },
  { label: "Capital Reserve", values: [-55_000, -57_750, -60_638, -63_669, -66_853] },
  { label: "Est. Taxes (25%)", values: [-47_330, -64_403, -82_870, -102_970, -124_678] },
  { label: "Distributable FCF", isHeader: true, values: [141_990, 193_207, 248_611, 308_909, 374_034] },
];

// Post-initiative cash flow
export const incomeStatementPostInitiative: IncomeStatementLine[] = [
  { label: "Revenue", isHeader: true, values: [4_950_000, 5_690_000, 5_942_000, 6_036_600, 6_314_430] },
  { label: "EBITDA", isHeader: true, values: [683_100, 848_100, 848_100, 958_100, 958_100] },
  { label: "EBITDA Margin", values: [13.8, 14.9, 14.3, 15.9, 15.2] },
  { label: "Initiative EBITDA Uplift", values: [129_100, 223_140, 146_381, 172_952, 82_935] },
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
  { name: "LP Debt (Pete)", lender: "Senior LP", amount: "$2.4M", rate: "10%", structure: "5-yr bullet", maturity: "2031", recourse: "Non-recourse" },
  { name: "Seller Note", lender: "Seller", amount: "$300K", rate: "6%", structure: "5-yr amort", maturity: "2031", recourse: "Non-recourse" },
  { name: "SCF Facility", lender: "TBD", amount: "$700K revolving", rate: "3.5%", structure: "Revolving", maturity: "Ongoing", recourse: "Non-recourse" },
  { name: "A/R Factoring", lender: "TBD", amount: "$400K revolving", rate: "3.0%", structure: "Revolving", maturity: "Ongoing", recourse: "Non-recourse" },
];

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

// ─── Full Scenario Returns ───────────────────────────────────────────────────
export interface FullScenario {
  name: string;
  exitMultiple: string;
  lp: { proceeds: string; moic: string; irr: string };
  mp: { proceeds: string; moic: string; irr: string };
  jp: { proceeds: string; moic: string; irr: string };
}

export const fullScenarios: FullScenario[] = [
  {
    name: "Bear",
    exitMultiple: "4.5×",
    lp: { proceeds: "$3.21M", moic: "1.34×", irr: "5.4%" },
    mp: { proceeds: "$2.86M", moic: "9.5×", irr: "57%" },
    jp: { proceeds: "$605K", moic: "2.02×", irr: "15.1%" },
  },
  {
    name: "Base",
    exitMultiple: "6.0×",
    lp: { proceeds: "$3.51M", moic: "1.46×", irr: "6.2%" },
    mp: { proceeds: "$4.28M", moic: "14.3×", irr: "70%" },
    jp: { proceeds: "$802K", moic: "2.67×", irr: "21.7%" },
  },
  {
    name: "Bull",
    exitMultiple: "7.5×",
    lp: { proceeds: "$3.81M", moic: "1.59×", irr: "7.0%" },
    mp: { proceeds: "$5.70M", moic: "19.0×", irr: "80%" },
    jp: { proceeds: "$999K", moic: "3.33×", irr: "27.2%" },
  },
  {
    name: "Stretch",
    exitMultiple: "9.0×",
    lp: { proceeds: "$4.11M", moic: "1.71×", irr: "7.7%" },
    mp: { proceeds: "$7.12M", moic: "23.7×", irr: "88%" },
    jp: { proceeds: "$1.20M", moic: "3.99×", irr: "31.9%" },
  },
];

// ─── Lender Comparisons ─────────────────────────────────────────────────────
export interface SCFLender {
  name: string;
  type: string;
  facilityFit: string;
  rate: string;
  approval: string;
  meetsTarget: string;
}

export const scfLenders: SCFLender[] = [
  { name: "eCapital", type: "Reverse Factoring / SCF", facilityFit: "✓ $400K–$1M", rate: "3.0–4.0%", approval: "HIGH ✓", meetsTarget: "✓ YES at 3.0–3.5%" },
  { name: "Riviera Finance", type: "Invoice Factoring", facilityFit: "✓ $200K–$2M", rate: "1–3% per 30d", approval: "HIGH ✓", meetsTarget: "⚠ MAYBE (tenor-dependent)" },
  { name: "Triumph Business Capital", type: "Invoice Factoring / SCF", facilityFit: "✓ $500K–$5M", rate: "2.5–4.5%", approval: "HIGH ✓", meetsTarget: "⚠ Check rate" },
  { name: "Resolve Pay", type: "B2B BNPL", facilityFit: "⚠ <$500K", rate: "2.61–3.5% flat", approval: "HIGH ✓", meetsTarget: "✓ YES" },
  { name: "C2FO (as supplier)", type: "Dynamic Discounting", facilityFit: "N/A — per invoice", rate: "2% annualized", approval: "MEDIUM", meetsTarget: "✓ If large buyers exist" },
];

export interface ARLender {
  name: string;
  type: string;
  rate: string;
  approval: string;
  meetsTarget: string;
}

export const arLenders: ARLender[] = [
  { name: "eCapital", type: "Non-Recourse A/R", rate: "2.5–4.0% / 30d", approval: "HIGH ✓", meetsTarget: "✓ YES at volume" },
  { name: "Riviera Finance", type: "Non-Recourse A/R", rate: "1–3% / 30d", approval: "HIGH ✓", meetsTarget: "✓ YES" },
  { name: "Triumph Business Capital", type: "Non-Recourse A/R", rate: "1.5–3.5%", approval: "HIGH ✓", meetsTarget: "✓ YES likely" },
  { name: "Bluevine", type: "Invoice Factoring", rate: "0.25–1.7%/week", approval: "HIGH ✓", meetsTarget: "✗ NO (APR too high)" },
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

// ─── SEP Partners Contact Info ───────────────────────────────────────────────
export const contactInfo = {
  name: "Keith Piper",
  title: "Managing Partner",
  company: "Southern Precision Partners",
  companyShort: "SPP",
  email: "deals@sep-partners.com",
  phone: "(404) 555-0120",
  website: "www.sep-partners.com",
  address: "Atlanta, GA",
};
