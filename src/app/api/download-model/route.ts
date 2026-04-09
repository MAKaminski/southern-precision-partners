import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

// ─── Constants matching Google Drive financials ──────────────────────────────
const YEARS = ["Yr 1", "Yr 2", "Yr 3", "Yr 4", "Yr 5"];
const SALES = [4800000, 5040000, 5292000, 5556600, 5834430];
const EBITDA_PCT = [0.115, 0.124, 0.133, 0.141, 0.150];

const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const SUB_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
const GREEN_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
const CUR = '"$"#,##0';
const PCT = "0.0%";
const MULT = '0.00"×"';

function hdr(row: ExcelJS.Row) { row.eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; c.alignment = { horizontal: "center", vertical: "middle" }; }); row.height = 22; }
function sub(row: ExcelJS.Row) { row.eachCell(c => { c.fill = SUB_FILL; c.font = { bold: true, size: 10 }; }); }
function grn(row: ExcelJS.Row) { row.eachCell(c => { c.fill = GREEN_FILL; c.font = { bold: true, size: 10, color: { argb: "FF059669" } }; }); }
function bdr(ws: ExcelJS.Worksheet, r1: number, r2: number, c1: number, c2: number) {
  const t: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFE2E8F0" } };
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) ws.getCell(r, c).border = { top: t, bottom: t, left: t, right: t };
}

export async function GET() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Southern Precision Partners";

  // ═══ TAB 1: Deal Overview ═══
  const ov = wb.addWorksheet("Deal Overview", { properties: { tabColor: { argb: "FF2563EB" } } });
  ov.columns = [{ key: "a", width: 30 }, { key: "b", width: 24 }];
  ov.addRow(["PROJECT MOSAIC — DEAL OVERVIEW", ""]); hdr(ov.getRow(1)); ov.mergeCells("A1:B1");
  [["Deal Name", "Project Mosaic"], ["Target", "Tile Center Group"], ["Location", "Georgia"], ["Deal Type", "Leveraged Buyout"],
   ["Managing Partner", "Keith Piper"], ["Firm", "Southern Precision Partners"], ["Contact", "deals@sep-partners.com"],
   ["", ""], ["Enterprise Value", 2490000], ["Total Raise", 3000000], ["Entry Multiple", "4.5×"], ["Exit EV Target", 9000000],
   ["Hold Period", "5 Years"], ["", ""],
   ["Baseline EBITDA (CIM)", 334000], ["+ Rent Reclamation", 90000], ["+ Florence Optimization", 28000],
   ["= Normalized Day 1 EBITDA", 452000], ["+ SCF Float (2%)", 56800], ["+ COGS Reduction (1.5%)", 45200],
   ["= Year 1 Pro-Forma EBITDA", 554000],
  ].forEach(([label, val]) => {
    const r = ov.addRow([label, val]);
    if (typeof val === "number") r.getCell(2).numFmt = CUR;
    if ((label as string).startsWith("=")) sub(r);
  });
  bdr(ov, 1, ov.rowCount, 1, 2);

  // ═══ TAB 2: Sources & Uses ═══
  const su = wb.addWorksheet("Sources & Uses", { properties: { tabColor: { argb: "FF059669" } } });
  su.columns = [{ key: "a", width: 40 }, { key: "b", width: 16 }, { key: "c", width: 14 }, { key: "d", width: 36 }];
  su.addRow(["Source", "Amount", "% of Total", "Terms"]); hdr(su.getRow(1));
  [[`LP Debt (Pete — Senior)`, 2400000, 0.80, "10% IO or 7% IO + 5% equity kicker"],
   ["Managing Partner Equity (Keith Piper)", 300000, 0.10, "80% ownership"],
   ["Seller Note", 300000, 0.10, "6%, 5-yr amort"]].forEach(s => {
    const r = su.addRow(s); r.getCell(2).numFmt = CUR; r.getCell(3).numFmt = PCT;
  });
  const stot = su.addRow(["Total Sources", { formula: "SUM(B2:B4)" }, { formula: "SUM(C2:C4)" }, ""]); sub(stot); stot.getCell(2).numFmt = CUR; stot.getCell(3).numFmt = PCT;
  su.addRow([]);
  su.addRow(["Use of Funds", "Amount", "", ""]); hdr(su.getRow(su.rowCount));
  const uStart = su.rowCount + 1;
  [["Business Acquisition", 2490000], ["Working Capital / Reserves", 200000], ["Fees & Closing Costs", 80000], ["MIP Reserve", 50000]].forEach(u => {
    const r = su.addRow([u[0], u[1], "", ""]); r.getCell(2).numFmt = CUR;
  });
  const uEnd = su.rowCount;
  const utot = su.addRow(["Total Uses", { formula: `SUM(B${uStart}:B${uEnd})` }, "", ""]); sub(utot); utot.getCell(2).numFmt = CUR;
  su.addRow([]); const chk = su.addRow(["Sources − Uses", { formula: `B5-B${su.rowCount}` }, "", ""]); chk.getCell(2).numFmt = CUR;
  bdr(su, 1, su.rowCount, 1, 4);

  // ═══ TAB 3: Scenario 1 (10% IO) ═══
  const s1 = wb.addWorksheet("Scenario 1 (10% IO)", { properties: { tabColor: { argb: "FF7C3AED" } } });
  s1.columns = [{ key: "a", width: 26 }, ...YEARS.map(y => ({ key: y, width: 15 }))];
  s1.addRow(["SCENARIO 1 — 10% LP IO", ...YEARS.map(() => "")]); hdr(s1.getRow(1)); s1.mergeCells("A1:F1");
  s1.addRow(["", ...YEARS]); sub(s1.getRow(2));

  // Row 3: Sales
  const s1Sales = s1.addRow(["Sales", ...SALES]); s1Sales.font = { bold: true }; s1Sales.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 4: EBITDA % (hardcoded)
  s1.addRow(["EBITDA %", ...EBITDA_PCT]).eachCell((c, i) => { if (i > 1) c.numFmt = PCT; });
  // Row 5: EBITDA = Sales × EBITDA%
  const s1ebitda = s1.addRow(["EBITDA (Post-Salary)", ...YEARS.map((_, i) => ({ formula: `${String.fromCharCode(66+i)}3*${String.fromCharCode(66+i)}4` }))]);
  sub(s1ebitda); s1ebitda.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 6: LP Interest = -$2.4M × 10%
  s1.addRow(["LP Interest (10% IO)", ...YEARS.map(() => -240000)]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 7: Seller Note P&I
  s1.addRow(["Seller Note (P&I)", ...YEARS.map(() => -69600)]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 8: Capital Reserve
  s1.addRow(["Capital Reserve", -55000, -57750, -60638, -63669, -66853]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 9: Pre-tax = EBITDA + Interest + SellerNote + Reserve
  const s1pretax = s1.addRow(["Pre-Tax Income", ...YEARS.map((_, i) => {
    const col = String.fromCharCode(66+i);
    return { formula: `${col}5+${col}6+${col}7+${col}8` };
  })]); s1pretax.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 10: Taxes = -25% × Pre-Tax
  s1.addRow(["Est. Taxes (25%)", ...YEARS.map((_, i) => ({ formula: `-0.25*${String.fromCharCode(66+i)}9` }))]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  // Row 11: Distributable FCF = Pre-Tax + Taxes
  const s1fcf = s1.addRow(["Distributable FCF", ...YEARS.map((_, i) => {
    const col = String.fromCharCode(66+i);
    return { formula: `${col}9+${col}10` };
  })]); grn(s1fcf); s1fcf.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });

  // Partner payouts
  s1.addRow([]);
  s1.addRow(["PARTNER PAYOUTS", ...YEARS.map(() => "")]); hdr(s1.getRow(s1.rowCount)); s1.mergeCells(`A${s1.rowCount}:F${s1.rowCount}`);
  s1.addRow(["Senior LP (10% yield)", ...YEARS.map(() => 240000)]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s1.addRow(["Managing Member", 35497, 48302, 62153, 77227, 264154]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s1.addRow(["Junior Partner", 35497, 48302, 62153, 77227, 109880]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s1.addRow(["Cumulative Capital Recoup", 70995, 167599, 291904, 446359, 600000]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });

  // LP Coverage
  s1.addRow([]);
  s1.addRow(["LP Coverage Ratio", ...YEARS.map((_, i) => ({ formula: `${String.fromCharCode(66+i)}5/${-1}*${String.fromCharCode(66+i)}6` }))]).eachCell((c, i) => { if (i > 1) c.numFmt = MULT; });

  bdr(s1, 1, s1.rowCount, 1, 6);

  // ═══ TAB 4: Scenario 2 (7% + Kicker) ═══
  const s2 = wb.addWorksheet("Scenario 2 (7%+Kicker)", { properties: { tabColor: { argb: "FFD97706" } } });
  s2.columns = [{ key: "a", width: 28 }, ...YEARS.map(y => ({ key: y, width: 15 }))];
  s2.addRow(["SCENARIO 2 — 7% IO + 5% EQUITY KICKER", ...YEARS.map(() => "")]); hdr(s2.getRow(1)); s2.mergeCells("A1:F1");
  s2.addRow(["", ...YEARS]); sub(s2.getRow(2));

  s2.addRow(["Sales", ...SALES]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["EBITDA %", ...EBITDA_PCT]).eachCell((c, i) => { if (i > 1) c.numFmt = PCT; });
  const s2ebitda = s2.addRow(["EBITDA (Post-Salary)", ...YEARS.map((_, i) => ({ formula: `${String.fromCharCode(66+i)}3*${String.fromCharCode(66+i)}4` }))]);
  sub(s2ebitda); s2ebitda.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["LP Interest (7% IO)", ...YEARS.map(() => -168000)]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Seller Note (P&I)", ...YEARS.map(() => -69600)]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Capital Reserve", -55000, -57750, -60638, -63669, -66853]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  const s2pretax = s2.addRow(["Pre-Tax Income", ...YEARS.map((_, i) => {
    const col = String.fromCharCode(66+i);
    return { formula: `${col}5+${col}6+${col}7+${col}8` };
  })]); s2pretax.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Est. Taxes (25%)", ...YEARS.map((_, i) => ({ formula: `-0.25*${String.fromCharCode(66+i)}9` }))]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  const s2fcf = s2.addRow(["Distributable FCF", ...YEARS.map((_, i) => {
    const col = String.fromCharCode(66+i);
    return { formula: `${col}9+${col}10` };
  })]); grn(s2fcf); s2fcf.eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });

  s2.addRow([]);
  s2.addRow(["PARTNER PAYOUTS (80/15/5)", ...YEARS.map(() => "")]); hdr(s2.getRow(s2.rowCount)); s2.mergeCells(`A${s2.rowCount}:F${s2.rowCount}`);
  s2.addRow(["Senior LP (7% yield)", ...YEARS.map(() => 168000)]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Managing Member (80%)", 48998, 61802, 75653, 90727, 328735]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Junior Partner (15%)", 48998, 61802, 75653, 90727, 80180]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Senior LP (5% equity)", 0, 0, 0, 0, 19120]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });
  s2.addRow(["Cumulative Recoup", 97995, 221599, 372904, 554359, 600000]).eachCell((c, i) => { if (i > 1) c.numFmt = CUR; });

  s2.addRow([]);
  const exitHdr = s2.addRow(["EXIT ANALYSIS ($9M EV, $6.6M post-debt)", "", "", "", "", ""]); hdr(exitHdr); s2.mergeCells(`A${exitHdr.number}:F${exitHdr.number}`);
  s2.addRow(["Senior LP (5%)", "", "", "", "", 330000]).getCell(6).numFmt = CUR;
  s2.addRow(["Junior Partner (15%)", "", "", "", "", 940500]).getCell(6).numFmt = CUR;
  s2.addRow(["Managing Member (80%)", "", "", "", "", 5330000]).getCell(6).numFmt = CUR;

  bdr(s2, 1, s2.rowCount, 1, 6);

  // ═══ TAB 5: Initiative Impact ═══
  const init = wb.addWorksheet("Initiative Impact", { properties: { tabColor: { argb: "FF059669" } } });
  init.columns = [{ key: "a", width: 32 }, { key: "b", width: 14 }, { key: "c", width: 16 }, { key: "d", width: 16 }, { key: "e", width: 18 }, { key: "f", width: 14 }];
  init.addRow(["GROWTH INITIATIVE PHASE TARGETS", "", "", "", "", ""]); hdr(init.getRow(1)); init.mergeCells("A1:F1");
  init.addRow(["Phase", "Years", "Sales Impact", "EBITDA Impact", "Projected EBITDA", "Margin"]); sub(init.getRow(2));

  const phases: [string, string, number, number, number, number][] = [
    ["Phase 1: Efficiency Engine", "Yr 1", 150000, 129100, 683100, 0.138],
    ["Phase 2: Commercial & Digital", "Yr 2–3", 650000, 165000, 848100, 0.145],
    ["Phase 3: Scale & Geo Expansion", "Yr 4–5", 480000, 110000, 958100, 0.164],
  ];
  const pStart = init.rowCount + 1;
  phases.forEach(p => {
    const r = init.addRow(p);
    [3,4,5].forEach(c => r.getCell(c).numFmt = CUR);
    r.getCell(6).numFmt = PCT;
  });
  const pEnd = init.rowCount;
  init.addRow([]);
  const ptot = init.addRow(["Total Initiative Impact", "", { formula: `SUM(C${pStart}:C${pEnd})` }, { formula: `SUM(D${pStart}:D${pEnd})` }, "", ""]);
  sub(ptot); ptot.getCell(3).numFmt = CUR; ptot.getCell(4).numFmt = CUR;

  // Pre vs Post comparison
  init.addRow([]);
  init.addRow(["PRE vs POST INITIATIVE COMPARISON", "", "", "", "", ""]); hdr(init.getRow(init.rowCount)); init.mergeCells(`A${init.rowCount}:F${init.rowCount}`);
  init.addRow(["Year", "Organic EBITDA", "Post-Init EBITDA", "Uplift", "Uplift %", ""]); sub(init.getRow(init.rowCount));

  const organic = [553920, 624960, 701719, 785148, 875165];
  const postInit = [683100, 848100, 848100, 958100, 958100];

  organic.forEach((o, i) => {
    const rn = init.rowCount + 1;
    const r = init.addRow([YEARS[i], o, postInit[i], { formula: `C${rn}-B${rn}` }, { formula: `D${rn}/B${rn}` }, ""]);
    [2,3,4].forEach(c => r.getCell(c).numFmt = CUR);
    r.getCell(5).numFmt = PCT;
  });

  bdr(init, 1, init.rowCount, 1, 6);

  // ═══ TAB 6: Returns & Sensitivity ═══
  const ret = wb.addWorksheet("Returns", { properties: { tabColor: { argb: "FFDC2626" } } });
  ret.columns = [{ key: "a", width: 36 }, { key: "b", width: 16 }, { key: "c", width: 16 }, { key: "d", width: 16 }, { key: "e", width: 12 }, { key: "f", width: 12 }];
  ret.addRow(["MOIC SENSITIVITY — Exit Multiple × Revenue Growth", "", "", "", "", ""]); hdr(ret.getRow(1)); ret.mergeCells("A1:F1");
  const revLabels = ["-40%", "-30%", "-20%", "-10%", "Base", "+10%"];
  ret.addRow(["Exit Multiple", ...revLabels]); sub(ret.getRow(2));

  const matrix = [
    ["4.0×", 2.40, 2.78, 3.17, 3.55, 3.93, 4.32],
    ["4.5×", 2.69, 3.12, 3.55, 3.98, 4.41, 4.84],
    ["5.0×", 2.97, 3.45, 3.93, 4.41, 4.89, 5.37],
    ["5.5×", 3.26, 3.79, 4.32, 4.84, 5.37, 5.90],
    ["6.0×", 3.55, 4.12, 4.70, 5.27, 5.85, 6.42],
    ["6.5×", 3.84, 4.46, 5.08, 5.70, 6.33, 6.95],
    ["7.0×", 4.12, 4.79, 5.47, 6.14, 6.81, 7.48],
    ["7.5×", 4.41, 5.13, 5.85, 6.57, 7.29, 8.00],
  ];
  matrix.forEach(r => { const row = ret.addRow(r); for (let c = 2; c <= 7; c++) row.getCell(c).numFmt = MULT; });

  bdr(ret, 1, ret.rowCount, 1, 7);

  // Generate
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=Project_Mosaic_LBO_Model.xlsx",
    },
  });
}
