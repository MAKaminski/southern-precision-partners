import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

const YEARS = ["Yr 1", "Yr 2", "Yr 3", "Yr 4", "Yr 5"];
const SALES = [4800000, 5040000, 5292000, 5556600, 5834430];
const EBITDA_PCT = [0.115, 0.124, 0.133, 0.141, 0.150];

// Styling helpers
const BLUE: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
const BLUE_LT: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8EEF4" } };
const GREEN_LT: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
const GRAY_LT: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
const WHT_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" };
const BLD: Partial<ExcelJS.Font> = { bold: true, size: 11, name: "Calibri" };
const REG: Partial<ExcelJS.Font> = { size: 11, name: "Calibri" };
const CUR = '#,##0';
const CUR_D = '"$"#,##0';
const PCT = "0.0%";
const MULT = '0.00"x"';
const THIN: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFD1D5DB" } };
const BORDER = { top: THIN, bottom: THIN, left: THIN, right: THIN };

function hdr(ws: ExcelJS.Worksheet, r: number, cols: number) {
  const row = ws.getRow(r);
  for (let c = 1; c <= cols; c++) { const cell = row.getCell(c); cell.fill = BLUE; cell.font = WHT_FONT; cell.alignment = { horizontal: "center", vertical: "middle" }; cell.border = BORDER; }
  row.height = 24;
}

function sub(ws: ExcelJS.Worksheet, r: number, cols: number) {
  const row = ws.getRow(r);
  for (let c = 1; c <= cols; c++) { const cell = row.getCell(c); cell.fill = BLUE_LT; cell.font = BLD; cell.border = BORDER; }
}

function tot(ws: ExcelJS.Worksheet, r: number, cols: number) {
  const row = ws.getRow(r);
  for (let c = 1; c <= cols; c++) { const cell = row.getCell(c); cell.fill = GREEN_LT; cell.font = { ...BLD, color: { argb: "FF059669" } }; cell.border = BORDER; }
}

function bdr(ws: ExcelJS.Worksheet, r1: number, r2: number, c1: number, c2: number) {
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) { ws.getCell(r, c).border = BORDER; ws.getCell(r, c).font = ws.getCell(r, c).font?.bold ? ws.getCell(r, c).font : REG; }
}

function col(c: number) { return String.fromCharCode(64 + c); }

export async function GET() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Southern Precision Partners";
  wb.created = new Date();

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 1: EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const es = wb.addWorksheet("Executive Summary", { properties: { tabColor: { argb: "FF1E3A5F" } }, views: [{ showGridLines: false }] });
  es.columns = [{ width: 32 }, { width: 18 }, { width: 18 }, { width: 4 }, { width: 32 }, { width: 18 }];

  es.mergeCells("A1:F1");
  es.getCell("A1").value = "PROJECT MOSAIC — CONFIDENTIAL INVESTMENT MEMORANDUM";
  es.getCell("A1").fill = BLUE; es.getCell("A1").font = { ...WHT_FONT, size: 14 }; es.getCell("A1").alignment = { horizontal: "center" };
  es.getRow(1).height = 32;

  es.mergeCells("A2:F2");
  es.getCell("A2").value = "Tile Center Group — Leveraged Buyout | Southern Precision Partners | April 2026";
  es.getCell("A2").font = { size: 10, italic: true, color: { argb: "FF64748B" }, name: "Calibri" }; es.getCell("A2").alignment = { horizontal: "center" };

  // Left column: Deal overview
  const ovData: [string, string | number, string?][] = [
    ["", ""],
    ["DEAL OVERVIEW", ""],
    ["Target", "Tile Center Group"],
    ["Location", "Georgia"],
    ["Managing Partner", "Keith Piper"],
    ["Deal Type", "Leveraged Buyout"],
    ["Total Raise", 3100000],
    ["Enterprise Value", 2490000],
    ["Entry Multiple", "4.5x"],
    ["Exit EV Target", 9000000],
    ["Hold Period", "5 Years"],
    ["", ""],
    ["EBITDA NORMALIZATION", ""],
    ["Baseline EBITDA (CIM)", 334000],
    ["+ Rent Reclamation", 90000],
    ["+ Florence Optimization", 28000],
    ["= Normalized Day 1", 452000],
    ["+ SCF Float (2%)", 56800],
    ["+ COGS Reduction (1.5%)", 45200],
    ["= Year 1 Pro-Forma EBITDA", 554000],
  ];

  ovData.forEach(([label, val], i) => {
    const r = i + 3;
    es.getCell(`A${r}`).value = label;
    es.getCell(`B${r}`).value = val;
    if (typeof val === "number") es.getCell(`B${r}`).numFmt = CUR_D;
    if (label.startsWith("=")) { es.getCell(`A${r}`).font = BLD; es.getCell(`B${r}`).font = BLD; }
    if (label === "DEAL OVERVIEW" || label === "EBITDA NORMALIZATION") { es.getCell(`A${r}`).font = { ...BLD, color: { argb: "FF1E3A5F" } }; es.getCell(`A${r}`).fill = BLUE_LT; es.getCell(`B${r}`).fill = BLUE_LT; }
  });

  // Right column: Capital structure
  const csData: [string, string | number][] = [
    ["", ""],
    ["CAPITAL STRUCTURE", ""],
    ["LP Debt (Pete — Senior)", 2400000],
    ["GP Equity (Keith Piper)", 400000],
    ["JP Equity (5% + 11% carry)", 100000],
    ["Seller Note (6%, 5-yr amort)", 200000],
    ["Total Sources", 3100000],
    ["", ""],
    ["PROFIT DISTRIBUTION WATERFALL", ""],
    ["1. Return of invested capital", "$500K (GP $400K + JP $100K)"],
    ["2. Remaining profits split:", ""],
    ["   GP (Keith Piper)", "79%"],
    ["   JP (5% equity + 11% carry)", "16%"],
    ["   LP equity kicker (Scen. 2)", "5%"],
    ["", ""],
    ["BASE CASE RETURNS ($9M Exit)", ""],
    ["GP MOIC", "13.05x"],
    ["JP MOIC", "10.76x"],
    ["GP-JP MOIC Variance", "+21.3%"],
    ["LP Total Proceeds", "$3.51M"],
  ];

  csData.forEach(([label, val], i) => {
    const r = i + 3;
    es.getCell(`E${r}`).value = label;
    es.getCell(`F${r}`).value = val;
    if (typeof val === "number") es.getCell(`F${r}`).numFmt = CUR_D;
    if (label === "CAPITAL STRUCTURE" || label === "PROFIT DISTRIBUTION WATERFALL" || label === "BASE CASE RETURNS ($9M Exit)") { es.getCell(`E${r}`).font = { ...BLD, color: { argb: "FF1E3A5F" } }; es.getCell(`E${r}`).fill = BLUE_LT; es.getCell(`F${r}`).fill = BLUE_LT; }
    if (label === "Total Sources") { es.getCell(`E${r}`).font = BLD; es.getCell(`F${r}`).font = BLD; }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 2: SCENARIO 1 (10% IO)
  // ═══════════════════════════════════════════════════════════════════════════
  const s1 = wb.addWorksheet("Scenario 1 — 10% IO", { properties: { tabColor: { argb: "FF7C3AED" } }, views: [{ showGridLines: false }] });
  s1.columns = [{ width: 30 }, ...YEARS.map(() => ({ width: 16 })), { width: 4 }, { width: 16 }];

  s1.mergeCells("A1:F1"); s1.getCell("A1").value = "SCENARIO 1 — 10% LP INTEREST-ONLY"; hdr(s1, 1, 6);
  s1.addRow(["", ...YEARS, "", ""]); sub(s1, 2, 6);

  // Revenue
  const s1r3 = s1.addRow(["Revenue (5% organic growth)", ...SALES]); s1r3.font = BLD;
  s1r3.eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  // EBITDA %
  s1.addRow(["EBITDA Margin %", ...EBITDA_PCT]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = PCT; });

  // EBITDA = Rev x Margin
  const s1r5 = s1.addRow(["EBITDA (Post-Salary)", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}3*${col(i+2)}4` }))]);
  sub(s1, 5, 6); s1r5.eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  s1.addRow([]); // spacer

  // Debt service section
  s1.addRow(["DEBT SERVICE & CASH FLOW", "", "", "", "", ""]); hdr(s1, 7, 6);
  s1.addRow(["LP Interest (10% IO on $2.4M)", ...YEARS.map(() => -240000)]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s1.addRow(["Seller Note P&I ($200K @ 6%)", ...YEARS.map(() => -46400)]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s1.addRow(["Capital Reserve (~1.1% Rev)", -55000, -57750, -60638, -63669, -66853]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  // Pre-tax = EBITDA + debt service + reserve
  const ptr = s1.rowCount + 1;
  s1.addRow(["Pre-Tax Income", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}5+${col(i+2)}8+${col(i+2)}9+${col(i+2)}10` }))]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  // Taxes
  s1.addRow(["Est. Taxes (25%)", ...YEARS.map((_, i) => ({ formula: `-0.25*${col(i+2)}${ptr}` }))]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  // FCF
  const fcfR = s1.rowCount + 1;
  const fcfRow = s1.addRow(["Distributable Free Cash Flow", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}${ptr}+${col(i+2)}${ptr+1}` }))]);
  tot(s1, fcfR, 6); fcfRow.eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  s1.addRow([]);

  // Partner payouts
  s1.addRow(["PARTNER DISTRIBUTIONS (83/17 — no LP kicker)", "", "", "", "", ""]); hdr(s1, s1.rowCount, 6);
  s1.addRow(["Managing Partner (Keith Piper)", 132294, 174804, 220789, 270836, 324890]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s1.addRow(["Junior Partner (5% eq + 11% carry)", 27096, 35803, 45222, 55473, 66544]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  // Cumulative
  s1.addRow([]);
  s1.addRow(["COVERAGE RATIOS", "", "", "", "", ""]); sub(s1, s1.rowCount, 6);
  s1.addRow(["DSCR (EBITDA / Total Debt Service)", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}5/(-(${col(i+2)}8+${col(i+2)}9))` }))]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = "0.00x"; });

  bdr(s1, 1, s1.rowCount, 1, 6);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 3: SCENARIO 2 (7% + Kicker)
  // ═══════════════════════════════════════════════════════════════════════════
  const s2 = wb.addWorksheet("Scenario 2 — 7% + Kicker", { properties: { tabColor: { argb: "FFD97706" } }, views: [{ showGridLines: false }] });
  s2.columns = [{ width: 30 }, ...YEARS.map(() => ({ width: 16 })), { width: 4 }, { width: 16 }];

  s2.mergeCells("A1:F1"); s2.getCell("A1").value = "SCENARIO 2 — 7% IO + 5% LP EQUITY KICKER"; hdr(s2, 1, 6);
  s2.addRow(["", ...YEARS]); sub(s2, 2, 6);

  s2.addRow(["Revenue (5% organic growth)", ...SALES]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s2.addRow(["EBITDA Margin %", ...EBITDA_PCT]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = PCT; });
  const s2r5 = s2.addRow(["EBITDA (Post-Salary)", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}3*${col(i+2)}4` }))]);
  sub(s2, 5, 6); s2r5.eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  s2.addRow([]);
  s2.addRow(["DEBT SERVICE & CASH FLOW", "", "", "", "", ""]); hdr(s2, 7, 6);
  s2.addRow(["LP Interest (7% IO on $2.4M)", ...YEARS.map(() => -168000)]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s2.addRow(["Seller Note P&I ($200K @ 6%)", ...YEARS.map(() => -46400)]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s2.addRow(["Capital Reserve", -55000, -57750, -60638, -63669, -66853]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  const s2ptr = s2.rowCount + 1;
  s2.addRow(["Pre-Tax Income", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}5+${col(i+2)}8+${col(i+2)}9+${col(i+2)}10` }))]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s2.addRow(["Est. Taxes (25%)", ...YEARS.map((_, i) => ({ formula: `-0.25*${col(i+2)}${s2ptr}` }))]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  const s2fcfR = s2.rowCount + 1;
  const s2fcf = s2.addRow(["Distributable Free Cash Flow", ...YEARS.map((_, i) => ({ formula: `${col(i+2)}${s2ptr}+${col(i+2)}${s2ptr+1}` }))]);
  tot(s2, s2fcfR, 6); s2fcf.eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  s2.addRow([]);
  s2.addRow(["PARTNER DISTRIBUTIONS (79/16/5)", "", "", "", "", ""]); hdr(s2, s2.rowCount, 6);
  s2.addRow(["Managing Partner (79%)", 168578, 209040, 252809, 300444, 351893]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s2.addRow(["Junior Partner (16%)", 34142, 42337, 51202, 60849, 71269]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });
  s2.addRow(["LP Equity Kicker (5%)", 10670, 13230, 16001, 19015, 22272]).eachCell((c, i) => { if (i > 1 && i <= 6) c.numFmt = CUR_D; });

  s2.addRow([]);
  s2.addRow(["EXIT ANALYSIS — $9M EV", "", "", "", "", ""]); hdr(s2, s2.rowCount, 6);
  s2.addRow(["Enterprise Value at Exit", "", "", "", "", 9000000]).getCell(6).numFmt = CUR_D;
  s2.addRow(["Less: LP Debt Repayment", "", "", "", "", -2400000]).getCell(6).numFmt = CUR_D;
  const postDebtR = s2.rowCount + 1;
  s2.addRow(["Post-Debt Equity", "", "", "", "", { formula: `F${postDebtR-2}+F${postDebtR-1}` }]).getCell(6).numFmt = CUR_D;
  sub(s2, postDebtR, 6);
  s2.addRow(["Less: Return of Capital", "", "", "", "", -500000]).getCell(6).numFmt = CUR_D;
  const remR = s2.rowCount + 1;
  s2.addRow(["Distributable Proceeds", "", "", "", "", { formula: `F${postDebtR}+F${remR-1}` }]).getCell(6).numFmt = CUR_D;
  tot(s2, remR, 6);
  s2.addRow(["GP Exit (79%)", "", "", "", "", { formula: `0.79*F${remR}+400000` }]).getCell(6).numFmt = CUR_D;
  s2.addRow(["JP Exit (16%)", "", "", "", "", { formula: `0.16*F${remR}+100000` }]).getCell(6).numFmt = CUR_D;
  s2.addRow(["LP Kicker (5%)", "", "", "", "", { formula: `0.05*F${remR}` }]).getCell(6).numFmt = CUR_D;
  s2.addRow([]);
  s2.addRow(["GP MOIC", "", "", "", "", { formula: `F${remR+1}/400000` }]).getCell(6).numFmt = MULT;
  s2.addRow(["JP MOIC", "", "", "", "", { formula: `F${remR+2}/100000` }]).getCell(6).numFmt = MULT;
  s2.addRow(["MOIC Variance (JP vs GP)", "", "", "", "", { formula: `(F${s2.rowCount}-F${s2.rowCount-1})/F${s2.rowCount-1}` }]).getCell(6).numFmt = "0.0%";

  bdr(s2, 1, s2.rowCount, 1, 6);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 4: INITIATIVE IMPACT
  // ═══════════════════════════════════════════════════════════════════════════
  const init = wb.addWorksheet("Growth Initiatives", { properties: { tabColor: { argb: "FF059669" } }, views: [{ showGridLines: false }] });
  init.columns = [{ width: 34 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 18 }, { width: 14 }];

  init.mergeCells("A1:F1"); init.getCell("A1").value = "GROWTH INITIATIVE PHASE TARGETS"; hdr(init, 1, 6);
  init.addRow(["Phase", "Years", "Sales Impact", "EBITDA Impact", "Projected EBITDA", "Margin"]); sub(init, 2, 6);

  const phases: [string, string, number, number, number, number][] = [
    ["Phase 1: Efficiency Engine", "Yr 1", 150000, 129100, 683100, 0.138],
    ["Phase 2: Commercial & Digital", "Yr 2–3", 650000, 165000, 848100, 0.145],
    ["Phase 3: Scale & Geo Expansion", "Yr 4–5", 480000, 110000, 958100, 0.164],
  ];
  const pStart = init.rowCount + 1;
  phases.forEach(p => {
    const r = init.addRow(p);
    [3,4,5].forEach(c => r.getCell(c).numFmt = CUR_D);
    r.getCell(6).numFmt = PCT;
  });
  init.addRow(["Total Initiative Impact", "", { formula: `SUM(C${pStart}:C${pStart+2})` }, { formula: `SUM(D${pStart}:D${pStart+2})` }, "", ""]);
  tot(init, init.rowCount, 6);
  init.getCell(`C${init.rowCount}`).numFmt = CUR_D;
  init.getCell(`D${init.rowCount}`).numFmt = CUR_D;

  // Pre vs Post comparison
  init.addRow([]);
  init.addRow(["PRE vs POST INITIATIVE COMPARISON", "", "", "", "", ""]); hdr(init, init.rowCount, 6);
  init.addRow(["Year", "Organic EBITDA", "Post-Init EBITDA", "Uplift $", "Uplift %", ""]); sub(init, init.rowCount, 6);

  const organic = [553920, 624960, 701719, 785148, 875165];
  const postInit = [683100, 848100, 848100, 958100, 958100];
  organic.forEach((o, i) => {
    const rn = init.rowCount + 1;
    const r = init.addRow([YEARS[i], o, postInit[i], { formula: `C${rn}-B${rn}` }, { formula: `D${rn}/B${rn}` }, ""]);
    [2,3,4].forEach(c => r.getCell(c).numFmt = CUR_D);
    r.getCell(5).numFmt = PCT;
  });

  bdr(init, 1, init.rowCount, 1, 6);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 5: RETURNS & SENSITIVITY
  // ═══════════════════════════════════════════════════════════════════════════
  const ret = wb.addWorksheet("Returns & Sensitivity", { properties: { tabColor: { argb: "FFDC2626" } }, views: [{ showGridLines: false }] });
  ret.columns = [{ width: 20 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];

  ret.mergeCells("A1:G1"); ret.getCell("A1").value = "INVESTOR RETURN ANALYSIS"; hdr(ret, 1, 7);

  ret.addRow(["Scenario", "Investor", "Invested", "Exit Proceeds", "MOIC", "Variance vs GP", ""]); sub(ret, 2, 7);
  const retData: [string, string, number, number][] = [
    ["Bear (4.5x)", "GP", 400000, 1506000],
    ["Bear (4.5x)", "JP", 100000, 324000],
    ["Base ($9M)", "GP", 400000, 5219000],
    ["Base ($9M)", "JP", 100000, 1076000],
    ["Bull (7.5x)", "GP", 400000, 6997000],
    ["Bull (7.5x)", "JP", 100000, 1436000],
    ["Stretch (9x)", "GP", 400000, 8774000],
    ["Stretch (9x)", "JP", 100000, 1796000],
  ];
  retData.forEach((d, i) => {
    const rn = ret.rowCount + 1;
    const r = ret.addRow([d[0], d[1], d[2], d[3], { formula: `D${rn}/C${rn}` }, "", ""]);
    r.getCell(3).numFmt = CUR_D; r.getCell(4).numFmt = CUR_D; r.getCell(5).numFmt = MULT;
    if (d[1] === "JP") {
      r.getCell(6).value = { formula: `(E${rn}-E${rn-1})/E${rn-1}` };
      r.getCell(6).numFmt = "0.0%";
    }
    if (i % 2 === 0) { r.getCell(1).font = BLD; }
  });

  // MOIC sensitivity
  ret.addRow([]);
  ret.addRow(["MOIC SENSITIVITY — Exit Multiple x Revenue Growth", "", "", "", "", "", ""]); hdr(ret, ret.rowCount, 7);
  const revLabels = ["-40%", "-30%", "-20%", "-10%", "Base", "+10%"];
  ret.addRow(["Exit Multiple", ...revLabels]); sub(ret, ret.rowCount, 7);

  const matrix = [
    ["4.0x", 2.40, 2.78, 3.17, 3.55, 3.93, 4.32],
    ["5.0x", 2.97, 3.45, 3.93, 4.41, 4.89, 5.37],
    ["6.0x", 3.55, 4.12, 4.70, 5.27, 5.85, 6.42],
    ["7.0x", 4.12, 4.79, 5.47, 6.14, 6.81, 7.48],
    ["8.0x", 4.70, 5.46, 6.23, 6.99, 7.76, 8.53],
  ];
  matrix.forEach(r => {
    const row = ret.addRow(r);
    for (let c = 2; c <= 7; c++) row.getCell(c).numFmt = MULT;
  });

  bdr(ret, 1, ret.rowCount, 1, 7);

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 6: SOURCES & USES
  // ═══════════════════════════════════════════════════════════════════════════
  const su = wb.addWorksheet("Sources & Uses", { properties: { tabColor: { argb: "FF059669" } }, views: [{ showGridLines: false }] });
  su.columns = [{ width: 38 }, { width: 16 }, { width: 14 }, { width: 36 }];

  su.mergeCells("A1:D1"); su.getCell("A1").value = "SOURCES & USES OF FUNDS"; hdr(su, 1, 4);
  su.addRow(["Source", "Amount", "% of Total", "Terms"]); sub(su, 2, 4);

  const sources: [string, number, number, string][] = [
    ["LP Debt (Pete — Senior)", 2400000, 0.774, "10% IO (or 7% + 5% kicker)"],
    ["GP Equity (Keith Piper)", 400000, 0.129, "79% profit share"],
    ["JP Equity (5% + 11% Carry)", 100000, 0.032, "5% equity + 11% carried interest = 16% effective"],
    ["Seller Note", 200000, 0.065, "6%, 5-yr amortization"],
  ];
  const sStart = su.rowCount + 1;
  sources.forEach(s => { const r = su.addRow(s); r.getCell(2).numFmt = CUR_D; r.getCell(3).numFmt = PCT; });
  su.addRow(["Total Sources", { formula: `SUM(B${sStart}:B${sStart+3})` }, { formula: `SUM(C${sStart}:C${sStart+3})` }, ""]);
  tot(su, su.rowCount, 4); su.getCell(`B${su.rowCount}`).numFmt = CUR_D; su.getCell(`C${su.rowCount}`).numFmt = PCT;

  su.addRow([]);
  su.addRow(["Use of Funds", "Amount", "", ""]); hdr(su, su.rowCount, 4);
  const uStart = su.rowCount + 1;
  [["Business Acquisition", 2490000], ["Working Capital / Reserves", 400000], ["Fees & Closing", 160000], ["MIP Reserve", 50000]].forEach(u => {
    su.addRow([u[0], u[1], "", ""]).getCell(2).numFmt = CUR_D;
  });
  su.addRow(["Total Uses", { formula: `SUM(B${uStart}:B${uStart+3})` }, "", ""]);
  tot(su, su.rowCount, 4); su.getCell(`B${su.rowCount}`).numFmt = CUR_D;

  su.addRow([]);
  su.addRow(["Sources − Uses Check", { formula: `B${sStart+4}-B${su.rowCount-1}` }, "", ""]);
  su.getCell(`B${su.rowCount}`).numFmt = CUR_D;

  bdr(su, 1, su.rowCount, 1, 4);

  // Generate
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=Project_Mosaic_LBO_Model.xlsx",
    },
  });
}
