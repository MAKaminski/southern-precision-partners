// ─── JP Requirements variance ────────────────────────────────────────────────
// Compares Keith's "5-Year Master Milestone Plan (JP Requirements)", draft
// v07/19/26, against the platform's current deliverables:
//   * financialYears / entryBasis / jpVestingSchedule in src/lib/data.ts
//   * the Delivery Plan (delivery_tasks) in Supabase
//
// The operational milestones in Keith's draft are already captured in the
// Delivery Plan (see operationalCoverage). The financial targets and deal
// terms below are the changes Keith INTRODUCED that are not yet reflected in
// the model — this is the shareable variance record.
//
// Source doc: 5Year_Milestone_Plan__JP_Requirements__DRAFT__v071926.docx

export const JP_DOC_LABEL = "5-Year Master Milestone Plan — JP Requirements (draft v07/19/26)";

// ── 5-year financial trajectory: our model vs Keith's draft ──────────────────
export interface YearCompare {
  label: string;
  ourRevenue: number;
  ourEbitda: number;
  ourMargin: number;
  keithRevenue: number;
  keithEbitda: number;
  keithMargin: number;
}

// "our" = src/lib/data.ts financialYears (Yr1 = 2027E … Yr5 = 2031E).
// "keith" = the JP Requirements consolidated summary table.
export const financialCompare: YearCompare[] = [
  { label: "Yr 1", ourRevenue: 5_500_000, ourEbitda: 495_000, ourMargin: 9.0, keithRevenue: 4_960_000, keithEbitda: 893_000, keithMargin: 18.0 },
  { label: "Yr 2", ourRevenue: 7_425_000, ourEbitda: 891_000, ourMargin: 12.0, keithRevenue: 5_456_000, keithEbitda: 1_091_000, keithMargin: 20.0 },
  { label: "Yr 3", ourRevenue: 10_395_000, ourEbitda: 1_455_300, ourMargin: 14.0, keithRevenue: 11_956_000, keithEbitda: 2_166_000, keithMargin: 18.1 },
  { label: "Yr 4", ourRevenue: 14_033_250, ourEbitda: 2_315_486, ourMargin: 16.5, keithRevenue: 15_482_000, keithEbitda: 2_965_000, keithMargin: 19.2 },
  { label: "Yr 5", ourRevenue: 17_190_730, ourEbitda: 3_094_331, ourMargin: 18.0, keithRevenue: 16_876_000, keithEbitda: 3_375_000, keithMargin: 20.0 },
];

// ── Explicit list of changes Keith introduced ───────────────────────────────
export interface Change {
  area: string;
  ours: string;
  keiths: string;
  impact: "material" | "moderate" | "captured";
  note: string;
}

export const changesKeithIntroduced: Change[] = [
  {
    area: "Year 1 EBITDA floor",
    ours: "9.0% margin — $495K EBITDA on $5.50M",
    keiths: "18.0% margin — $893K EBITDA on $4.96M",
    impact: "material",
    note: "Keith front-loads the 18% floor into Year 1 via product-attachment (+200 bps GM) and setup-CapEx reclassification. Our model ramps margin 9% → 18% over five years, so this pulls ~$400K of EBITDA and ~9 points of margin forward into the first year.",
  },
  {
    area: "Growth structure",
    ours: "Organic same-store ramp to ~$17.2M by Yr 5",
    keiths: "Flat organic Yr 1–2, then multi-site acquisition roll-up",
    impact: "material",
    note: "Keith holds Columbia/Florence flat ($4.96M → $5.46M) and drives the step-up through acquisitions (Rock Hill + Mint Hill in Yr 3, Greenville in Yr 4). Our revenue-by-year curve assumes organic growth; the totals land close by Yr 5 but the shape and risk profile differ.",
  },
  {
    area: "Year 5 EBITDA target",
    ours: "$3.09M @ 18.0% (Delivery Plan says “$3M @ 18%”)",
    keiths: "$3.375M @ 20.0%",
    impact: "moderate",
    note: "Keith raises the exit-year target by ~$281K and 200 bps by holding every mature location at a 20% margin cap.",
  },
  {
    area: "Michael's equity",
    ours: "JP equity vests 0% → 20% over the hold",
    keiths: "Milestone-based equity transition up to 30%",
    impact: "material",
    note: "Keith's draft raises Michael's terminal equity by 10 points (20% → 30%). At the Yr-5 valuation that is a materially larger JP stake than the current jpVestingSchedule.",
  },
  {
    area: "Executive compensation",
    ours: "Keith $150K (HR roster); no scheduled step-ups",
    keiths: "Michael $200K (Yr 3), Keith $200K match (Yr 4) — $400K combined",
    impact: "material",
    note: "Two scheduled salary step-ups to a $400K combined executive comp line, both gated on maintaining DSCR ≥ 1.35x. Not currently in the model's OpEx.",
  },
  {
    area: "DSCR covenant",
    ours: "Not stated in the model",
    keiths: "Maintain DSCR ≥ 1.35x across the expanded platform",
    impact: "moderate",
    note: "A new hard financial constraint governing the comp step-ups and the expansion debt package.",
  },
  {
    area: "Acquisition pricing",
    ours: "Delivery Plan has the acquisition tasks, no prices",
    keiths: "Rock Hill $3.80M, Greenville $2.40M (Mint Hill implied)",
    impact: "moderate",
    note: "Keith attaches specific purchase prices and per-location sales/EBITDA ramps to the acquisitions our plan lists only as milestones.",
  },
  {
    area: "Per-location P&L targets",
    ours: "Consolidated model only",
    keiths: "18% floor / 20% cap enforced per location, by year",
    impact: "moderate",
    note: "Keith introduces granular per-site sales and EBITDA requirements (Columbia/Florence, Rock Hill, Mint Hill, Greenville) that the consolidated model does not break out.",
  },
  {
    area: "Exit valuation",
    ours: "“Pending exit model” (MOIC/IRR intentionally omitted)",
    keiths: "7.5× EBITDA = $25.31M; ~$19.10M net, 100% tax-free (QSBS §1202)",
    impact: "material",
    note: "Keith fills in the exit our model left open — a 7.5× multiple, ~$5.4M debt/fee payoff, and a QSBS §1202 tax-free treatment on the ~$19.10M net distributable. The QSBS assumption in particular should be confirmed with tax counsel before it's relied on.",
  },
  {
    area: "Real-estate tax strategy",
    ours: "Not in the model",
    keiths: "Cost-segregation + accelerated depreciation (Yr 4)",
    impact: "moderate",
    note: "New Yr-4 workstream to deliver tax-shielded rental distributions from the holding entities.",
  },
];

// ── Keith's per-location requirements table (from the draft) ─────────────────
export interface LocationRow {
  location: string;
  y1: string; y2: string; y3: string; y4: string; y5: string;
}
export const perLocationRequirements: LocationRow[] = [
  { location: "Columbia & Florence (Hub)", y1: "$4,960K / 18.0%", y2: "$5,456K / 20.0%", y3: "$6,001K / 20.0%", y4: "$6,601K / 20.0%", y5: "$7,261K / 20.0%" },
  { location: "Rock Hill, SC (acq. Yr 3, $3.80M)", y1: "—", y2: "—", y3: "$3,800K / 18.0%", y4: "$4,104K / 20.0%", y5: "$4,432K / 20.0%" },
  { location: "Mint Hill, NC (acq. Yr 3)", y1: "—", y2: "—", y3: "$2,155K / 12.4%", y4: "$2,371K / 16.0%", y5: "$2,561K / 20.0%" },
  { location: "Greenville, SC (acq. Yr 4, $2.40M)", y1: "—", y2: "—", y3: "—", y4: "$2,406K / 18.5%", y5: "$2,622K / 20.0%" },
];

// ── Operational milestone coverage: Keith's items already in the Delivery Plan ─
export interface CoverageRow {
  milestone: string;
  deliveryYear: number;
  capturedAs: string;
}
export const operationalCoverage: CoverageRow[] = [
  { milestone: "ERP & CRM cloud migration; digital invoicing; legacy back-scan", deliveryYear: 1, capturedAs: "ERP/CRM Licensing • Back-Scan 12-Mo Legacy Records • Digital-Only Invoicing • Electronic Records (A/P, A/R, Vendor)" },
  { milestone: "Pro Desk technical stack + Grab-and-Go; Text/Phone-to-Confirm & pre-staging", deliveryYear: 1, capturedAs: "Pro Desk Activation + Grab-and-Go Assortment • Text-to-Confirm & Pre-Staging Protocol • Pro Fast Pass Lane" },
  { milestone: "Project attachment +15%, force to 46% GM", deliveryYear: 1, capturedAs: "Premium Upsell — 46% Margin" },
  { milestone: "3D visualizer tool + real-time stock API", deliveryYear: 1, capturedAs: "3D Visualizer • Digital Design • Website Upgrade / Omni-Channel" },
  { milestone: "Supply-chain financing; retire SBA Express line; volume discounts", deliveryYear: 2, capturedAs: "Supply Chain Financing Facility • Retire SBA Express LOC • Volume Purchasing Discounts" },
  { milestone: "Large-format porcelain showroom", deliveryYear: 2, capturedAs: "Porcelain Showroom • 3D Rendering" },
  { milestone: "Rock Hill & Mint Hill integration; expansion financing", deliveryYear: 3, capturedAs: "Rock Hill, SC • Mint Hill, NC • Expansion Financing" },
  { milestone: "Greenville integration; live-shopping; Pro & DIY B2B portals", deliveryYear: 4, capturedAs: "Greenville, SC • Live-Shopping • Pro Portal • DIY Portal • Live Inventory / Lead Times" },
  { milestone: "18% EBITDA floor; SBA + seller-note payoff; exit", deliveryYear: 5, capturedAs: "$3M EBITDA @ 18% • SBA Payoff • Seller Note Payoff • Prep For Sale • Sell" },
];
