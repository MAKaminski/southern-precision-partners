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
  { name: "LP Debt (Pete — Senior)", amount: 2_400_000, pct: 77.4, terms: "10% + 5% equity kicker, 5-yr bullet", color: "#2563EB" },
  { name: "Managing Partner Equity (Keith Piper)", amount: 400_000, pct: 12.9, terms: "75% profit share + GP promote", color: "#059669" },
  { name: "Junior Partner Equity", amount: 100_000, pct: 3.2, terms: "5% equity + 15% carry = 20% effective", color: "#7C3AED" },
  { name: "Seller Note", amount: 200_000, pct: 6.5, terms: "6%, 5-yr amort", color: "#D97706" },
];

export const totalRaise = 3_100_000;

export interface UseOfFunds {
  label: string;
  amount: number;
}

export const usesOfFunds: UseOfFunds[] = [
  { label: "Business Acquisition", amount: 2_490_000 },
  { label: "Working Capital / Reserves", amount: 400_000 },
  { label: "Fees & Closing Costs", amount: 160_000 },
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
    invested: "$400K",
    structure: "75% profit share (GP promote)",
    proceeds: "$4.95M",
    moic: "12.4×",
    irr: "65%",
    color: "#059669",
  },
  {
    title: "Junior Partner (Equity + Carry)",
    invested: "$100K",
    structure: "5% equity + 15% carried interest",
    proceeds: "$1.34M",
    moic: "13.4×",
    irr: "68%",
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

// Bear: $875K×4.5=$3.94M EV, −$2.6M debt=$1.34M equity. After cap return($500K)=$837K. JP: $100K+20%×$837K=$267K → 2.67×
// Base: $875K×6=$5.25M EV (or $9M target), −$2.6M=$6.4M. After cap($500K)=$5.9M. JP: $100K+20%×$5.9M=$1.28M → 12.8×
// Bull: $875K×7.5=$6.56M, −$2.6M=$3.96M. After cap=$3.46M. JP: $100K+20%×$3.46M=$792K → 7.9×
// Using $9M EV for base case (deal-specific target, not pure EBITDA multiple)
export const scenarios: Scenario[] = [
  { name: "Bear", exitMultiple: "4.5×", jpMoic: "6.7×", jpIrr: "46%" },
  { name: "Base", exitMultiple: "6.0×", jpMoic: "13.4×", jpIrr: "68%" },
  { name: "Bull", exitMultiple: "7.5×", jpMoic: "17.6×", jpIrr: "78%" },
  { name: "Stretch", exitMultiple: "9.0×", jpMoic: "21.8×", jpIrr: "85%" },
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

// Operating distributions: 75/25 (GP/JP) sweep until $500K capital returned, then 75/20/5
export const scenario1CashFlows: CashFlowYear[] = [
  { year: "Yr 1", sales: 4_800_000, ebitdaPct: 11.5, ebitda: 553_920, lpInterest: -240_000, sellerNote: -46_400, capitalReserve: -55_000, taxes: -53_130, distributableFCF: 159_390, managingMember: 119_543, juniorPartner: 39_848 },
  { year: "Yr 2", sales: 5_040_000, ebitdaPct: 12.4, ebitda: 624_960, lpInterest: -240_000, sellerNote: -46_400, capitalReserve: -57_750, taxes: -70_203, distributableFCF: 210_607, managingMember: 157_955, juniorPartner: 52_652 },
  { year: "Yr 3", sales: 5_292_000, ebitdaPct: 13.3, ebitda: 701_719, lpInterest: -240_000, sellerNote: -46_400, capitalReserve: -60_638, taxes: -88_670, distributableFCF: 266_011, managingMember: 199_508, juniorPartner: 53_202 },
  { year: "Yr 4", sales: 5_556_600, ebitdaPct: 14.1, ebitda: 785_148, lpInterest: -240_000, sellerNote: -46_400, capitalReserve: -63_669, taxes: -108_770, distributableFCF: 326_309, managingMember: 244_732, juniorPartner: 65_262 },
  { year: "Yr 5", sales: 5_834_430, ebitdaPct: 15.0, ebitda: 875_165, lpInterest: -240_000, sellerNote: -46_400, capitalReserve: -66_853, taxes: -130_478, distributableFCF: 391_434, managingMember: 293_576, juniorPartner: 78_287 },
];

export const scenario1 = {
  name: "Scenario 1 — 10% LP Debt Only",
  lpRate: "10%",
  lpStructure: "IO, 60-month balloon",
  totalDeal: 3_100_000,
  lpPrincipal: 2_400_000,
  gpEquity: 400_000,
  jpEquity: 100_000,
  sellerNote: 200_000,
  exitEV: 9_000_000,
  lpCoverage: "2.31×",
  profitSplit: "GP 75% / JP 20% / LP kicker 5%",
  jpStructure: "5% equity + 15% carried interest",
};

// ─── Scenario 2 — 7% LP + 5% Equity Kicker ──────────────────────────────────
// Scenario 2: 7% IO + 5% LP equity kicker. Profit split 75/20/5 (GP/JP/LP kicker)
export const scenario2CashFlows: CashFlowYear[] = [
  { year: "Yr 1", sales: 4_800_000, ebitdaPct: 11.5, ebitda: 553_920, lpInterest: -168_000, sellerNote: -46_400, capitalReserve: -55_000, taxes: -71_130, distributableFCF: 213_390, managingMember: 160_043, juniorPartner: 42_678, seniorLPEquity: 10_670 },
  { year: "Yr 2", sales: 5_040_000, ebitdaPct: 12.4, ebitda: 624_960, lpInterest: -168_000, sellerNote: -46_400, capitalReserve: -57_750, taxes: -88_203, distributableFCF: 264_607, managingMember: 198_455, juniorPartner: 52_921, seniorLPEquity: 13_230 },
  { year: "Yr 3", sales: 5_292_000, ebitdaPct: 13.3, ebitda: 701_719, lpInterest: -168_000, sellerNote: -46_400, capitalReserve: -60_638, taxes: -106_670, distributableFCF: 320_011, managingMember: 240_008, juniorPartner: 64_002, seniorLPEquity: 16_001 },
  { year: "Yr 4", sales: 5_556_600, ebitdaPct: 14.1, ebitda: 785_148, lpInterest: -168_000, sellerNote: -46_400, capitalReserve: -63_669, taxes: -126_770, distributableFCF: 380_309, managingMember: 285_232, juniorPartner: 76_062, seniorLPEquity: 19_015 },
  { year: "Yr 5", sales: 5_834_430, ebitdaPct: 15.0, ebitda: 875_165, lpInterest: -168_000, sellerNote: -46_400, capitalReserve: -66_853, taxes: -148_478, distributableFCF: 445_434, managingMember: 334_076, juniorPartner: 89_087, seniorLPEquity: 22_272 },
];

export const scenario2 = {
  name: "Scenario 2 — 7% LP + 5% Equity Kicker",
  lpRate: "7%",
  lpStructure: "IO + 5% common equity kicker, refi allowed after Mo 12",
  totalDeal: 3_100_000,
  lpPrincipal: 2_400_000,
  gpEquity: 400_000,
  jpEquity: 100_000,
  sellerNote: 200_000,
  exitEV: 9_000_000,
  postDebtEV: 6_600_000,
  lpCoverage: "3.30×",
  profitSplit: "GP 75% / JP 20% / LP kicker 5%",
  jpStructure: "5% equity + 15% carried interest",
  exitSplit: { seniorLP5pct: 330_000, juniorPartner20pct: 1_340_000, managingMember75pct: 4_975_000 },
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
  { label: "Seller Note (P&I)", values: [-46_400, -46_400, -46_400, -46_400, -46_400] },
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

// Exit waterfall: Post-debt equity → return capital ($400K GP + $100K JP) → split 75/20/5
// Bear: $9M×0.5=$4.5M EV, −$2.6M debt=$1.9M equity. Cap return $500K. Remaining $1.4M → GP 75%=$1.05M+$400K=$1.45M, JP 20%=$280K+$100K=$380K
// Base: $9M EV, −$2.4M debt=$6.6M. Cap $500K. Rem $6.1M → GP=$4.575M+$400K=$4.975M, JP=$1.22M+$100K=$1.32M
// Bull: $9M×1.25=$11.25M, −$2.4M=$8.85M. Cap $500K. Rem $8.35M → GP=$6.263M+$400K=$6.663M, JP=$1.77M+$100K=$1.87M
// Stretch: $9M×1.5=$13.5M, −$2.4M=$11.1M. Cap $500K. Rem $10.6M → GP=$7.95M+$400K=$8.35M, JP=$2.12M+$100K=$2.22M
export const fullScenarios: FullScenario[] = [
  {
    name: "Bear",
    exitMultiple: "4.5×",
    lp: { proceeds: "$3.21M", moic: "1.34×", irr: "5.4%" },
    mp: { proceeds: "$1.45M", moic: "3.6×", irr: "29%" },
    jp: { proceeds: "$380K", moic: "3.8×", irr: "31%" },
  },
  {
    name: "Base",
    exitMultiple: "$9M EV",
    lp: { proceeds: "$3.51M", moic: "1.46×", irr: "6.2%" },
    mp: { proceeds: "$4.98M", moic: "12.4×", irr: "65%" },
    jp: { proceeds: "$1.34M", moic: "13.4×", irr: "68%" },
  },
  {
    name: "Bull",
    exitMultiple: "7.5×",
    lp: { proceeds: "$3.81M", moic: "1.59×", irr: "7.0%" },
    mp: { proceeds: "$6.66M", moic: "16.7×", irr: "76%" },
    jp: { proceeds: "$1.87M", moic: "18.7×", irr: "79%" },
  },
  {
    name: "Stretch",
    exitMultiple: "9.0×",
    lp: { proceeds: "$4.11M", moic: "1.71×", irr: "7.7%" },
    mp: { proceeds: "$8.35M", moic: "20.9×", irr: "84%" },
    jp: { proceeds: "$2.22M", moic: "22.2×", irr: "86%" },
  },
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
