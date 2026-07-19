/**
 * Parses Mosaic_1.xlsx and emits SQL files for the SMALL tables (everything
 * except the ~23K-row AR ledger) so they can be loaded through the Supabase
 * MCP channel when direct network egress to the project host is unavailable.
 *
 * Writes <outdir>/{01_customers,02_annual,03_delivery,04_forecast,05_debt_revenue}.sql
 *
 * Usage: node scripts/emit-load-sql.mjs <xlsx> <outdir>
 */
import ExcelJS from "exceljs";
import { writeFileSync } from "node:fs";

const XLSX = process.argv[2] || "/root/.claude/uploads/3781f327-7d4c-5828-a4a2-ec1070370af4/56ae28aa-Mosaic_1.xlsx";
const OUT = process.argv[3] || "/tmp";

const unwrap = (v) => (v && typeof v === "object" && "result" in v ? v.result : v);
const asNum = (v) => { v = unwrap(v); if (v === null || v === undefined || v === "") return null; if (typeof v === "number") return Number.isFinite(v) ? v : null; const n = parseFloat(String(v).replace(/[$,]/g, "")); return Number.isFinite(n) ? n : null; };
const asStr = (v) => { v = unwrap(v); if (v === null || v === undefined) return null; const s = String(v).trim(); return s === "" ? null : s; };
const nameKey = (v) => { const s = asStr(v); return s ? s.replace(/\s+/g, " ").trim().toUpperCase() : null; };
const q = (s) => (s === null || s === undefined ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined ? "null" : String(v));
const mdyToISO = (m, d, y) => { m = asNum(m); d = asNum(d); y = asNum(y); if (!m || !d || !y) return null; if (y < 100) y += 2000; if (m < 1 || m > 12 || d < 1 || d > 31) return null; return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; };
const anyDateToISO = (v) => { v = unwrap(v); if (!v) return null; if (v instanceof Date) return v.toISOString().slice(0, 10); const s = String(v).trim(); const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); if (m) return mdyToISO(m[1], m[2], m[3]); return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null; };
const cell = (row, c) => unwrap(row.getCell(c).value);

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);

// ---- master + annual + AR-derived aggregates ----
const master = new Map();
const touch = (nameRaw, code, alias) => {
  const key = nameKey(nameRaw); if (!key) return null;
  let r = master.get(key);
  if (!r) { r = { name: asStr(nameRaw), name_key: key, code: null, alias: null }; master.set(key, r); }
  if (code && !r.code) r.code = asStr(code);
  if (alias && !r.alias) r.alias = asStr(alias);
  return r;
};
wb.getWorksheet("Customer_Data").eachRow((row, r) => { if (r < 4) return; touch(cell(row, 2), null, cell(row, 3)); });

const annual = new Map(); // name_key -> {year:sales}
for (const [year, sheet] of [[2024, "SUMMARY 24"], [2025, "SUMMARY 25"], [2026, "SUMMARY 26"]]) {
  wb.getWorksheet(sheet).eachRow((row, r) => {
    if (r < 2) return;
    const rec = touch(cell(row, 2)); const sales = asNum(cell(row, 3));
    if (rec && sales !== null) { if (!annual.has(rec.name_key)) annual.set(rec.name_key, {}); annual.get(rec.name_key)[year] = (annual.get(rec.name_key)[year] || 0) + sales; }
  });
}
// AR-derived aggregates (first/last sale, counts, balance) so customers are complete even before the AR ledger loads
const agg = new Map();
for (const [year, sheet] of [[2024, "2024 AR"], [2025, "2025 AR"], [2026, "2026 AR"]]) {
  wb.getWorksheet(sheet).eachRow((row) => {
    const key = nameKey(cell(row, 2)); if (!key) return;
    touch(cell(row, 2), cell(row, 1));
    const invAmtRaw = asNum(cell(row, 7)); const payAmtRaw = asNum(cell(row, 12));
    const payRef = asStr(cell(row, 8)); const isCredit = !!(payRef && /^LC/i.test(payRef));
    const invDate = mdyToISO(cell(row, 3), cell(row, 4), cell(row, 5));
    const payDate = mdyToISO(cell(row, 9), cell(row, 10), cell(row, 11));
    const invAmt = invAmtRaw === null ? null : Math.abs(invAmtRaw);
    const payAmt = payAmtRaw === null ? null : Math.abs(payAmtRaw);
    if (invAmt === null && payAmt === null && !invDate && !payDate) return;
    let a = agg.get(key); if (!a) { a = { invSum: 0, paySum: 0, invCnt: 0, payCnt: 0, firstD: null, lastD: null }; agg.set(key, a); }
    if (invAmt !== null && !isCredit) { a.invSum += invAmt; a.invCnt++; }
    if (payAmt !== null) { a.paySum += payAmt; a.payCnt++; }
    const d = invDate || payDate;
    if (d) { if (!a.firstD || d < a.firstD) a.firstD = d; if (!a.lastD || d > a.lastD) a.lastD = d; }
  });
}
const seg = (s) => (s >= 100000 ? "top" : s >= 25000 ? "mid" : "tail");

// ---- 01 customers ----
{
  const rows = [...master.values()].map((r) => {
    const an = annual.get(r.name_key) || {}; const lts = Object.values(an).reduce((a, b) => a + b, 0);
    const a = agg.get(r.name_key) || { invSum: 0, paySum: 0, invCnt: 0, payCnt: 0, firstD: null, lastD: null };
    return `(${q(r.code)},${q(r.name)},${q(r.name_key)},${q(r.alias)},${q(a.firstD)},${q(a.lastD)},${Math.round(lts * 100) / 100},${a.invCnt},${Math.round(a.paySum * 100) / 100},${a.payCnt},${Math.round((a.invSum - a.paySum) * 100) / 100},${q(seg(lts))},'mosaic_xlsx')`;
  });
  const sql = `insert into customers (customer_code,name,name_key,alias,first_sale_date,last_sale_date,lifetime_sales,lifetime_sale_count,lifetime_payments,lifetime_payment_count,balance,segment,source) values\n${rows.join(",\n")}\non conflict (name_key) do update set customer_code=excluded.customer_code,alias=excluded.alias,first_sale_date=excluded.first_sale_date,last_sale_date=excluded.last_sale_date,lifetime_sales=excluded.lifetime_sales,lifetime_sale_count=excluded.lifetime_sale_count,lifetime_payments=excluded.lifetime_payments,lifetime_payment_count=excluded.lifetime_payment_count,balance=excluded.balance,segment=excluded.segment;`;
  writeFileSync(`${OUT}/01_customers.sql`, sql);
  console.log("customers:", rows.length);
}

// ---- 02 annual (join to customers on name_key) ----
{
  const vals = [];
  for (const [key, byYear] of annual.entries()) for (const [year, sales] of Object.entries(byYear)) vals.push(`(${q(key)},${year},${Math.round(sales * 100) / 100})`);
  const sql = `insert into customer_annual_sales (customer_id,year,sales)\nselect c.id, v.year, v.sales from (values\n${vals.join(",\n")}\n) as v(name_key,year,sales) join customers c using (name_key)\non conflict (customer_id,year) do update set sales=excluded.sales;`;
  writeFileSync(`${OUT}/02_annual.sql`, sql);
  console.log("annual:", vals.length);
}

// ---- 03 delivery ----
{
  const rows = [];
  wb.getWorksheet("Delivery Plan").eachRow((row, r) => {
    if (r < 2) return;
    const title = asStr(cell(row, 8)); const dyear = asNum(cell(row, 1));
    if (!title || /^TOTAL/i.test(title) || dyear === null) return;
    rows.push(`(${Math.round(dyear)},${n(asNum(cell(row, 2)))},${n(asNum(cell(row, 3)))},${q(asStr(cell(row, 4)))},${n(asNum(cell(row, 5)))},${q(anyDateToISO(cell(row, 6)))},${q(anyDateToISO(cell(row, 7)))},${q(title)},${q(asStr(cell(row, 9)))},${q(asStr(cell(row, 10)))},${n(asNum(cell(row, 11)))},${n(asNum(cell(row, 12)))},'not_started',${r})`);
  });
  const sql = `insert into delivery_tasks (delivery_year,item,task,system,rank,start_date,end_date,title,next_step,owner,cost_k,benefit_k,status,sort_order) values\n${rows.join(",\n")};`;
  writeFileSync(`${OUT}/03_delivery.sql`, sql);
  console.log("delivery:", rows.length);
}

// ---- 04 forecast ----
{
  const rows = [];
  for (const [scenario, sheet] of [["forecast", "Forecast"], ["plan", "Plan"]]) {
    const ws = wb.getWorksheet(sheet); const header = ws.getRow(1); const years = [];
    for (let c = 2; c <= 20; c++) { const y = asNum(cell(header, c)); if (y && y >= 2015 && y <= 2100) years.push({ col: c, year: Math.round(y) }); }
    ws.eachRow((row, r) => {
      if (r < 2) return; const category = asStr(cell(row, 1)); if (!category) return;
      const isPct = /%/.test(category);
      for (const { col, year } of years) { const v = asNum(cell(row, col)); if (v === null) continue; rows.push(`(${q(scenario)},${q(category)},${year},${v},${isPct},${r})`); }
    });
  }
  const sql = `insert into forecast_pnl (scenario,category,year,value,is_percent,sort_order) values\n${rows.join(",\n")}\non conflict (scenario,category,year) do update set value=excluded.value;`;
  writeFileSync(`${OUT}/04_forecast.sql`, sql);
  console.log("forecast:", rows.length);
}

// ---- 05 debt + revenue ----
{
  const stmts = [];
  // debt from Summary
  {
    const ws = wb.getWorksheet("Summary"); const header = ws.getRow(1); const years = [];
    for (let c = 2; c <= 20; c++) { const y = asNum(cell(header, c)); if (y && y >= 2015 && y <= 2100) years.push({ col: c, year: Math.round(y) }); }
    let facility = null; const byFacYear = new Map();
    ws.eachRow((row) => {
      const label = (asStr(cell(row, 1)) || "").toLowerCase(); if (!label) return;
      if (label.includes("seller note")) facility = "Seller Note";
      else if (label.includes("debt servicing") || label.includes("sba")) facility = "SBA";
      if (!facility) return;
      let field = null;
      if (label === "principal") field = "principal"; else if (label === "interest") field = "interest"; else if (label.startsWith("ending")) field = "ending_balance";
      if (!field) return;
      for (const { col, year } of years) { const v = asNum(cell(row, col)); if (v === null) continue; const k = `${facility}|${year}`; if (!byFacYear.has(k)) byFacYear.set(k, { facility, year, principal: null, interest: null, ending_balance: null }); byFacYear.get(k)[field] = v; }
    });
    const rows = [...byFacYear.values()].map((d) => `(${q(d.facility)},${d.year},${n(d.principal)},${n(d.interest)},${n(d.ending_balance)})`);
    if (rows.length) stmts.push(`insert into debt_schedule (facility,year,principal,interest,ending_balance) values\n${rows.join(",\n")}\non conflict (facility,year) do update set principal=excluded.principal,interest=excluded.interest,ending_balance=excluded.ending_balance;`);
    console.log("debt:", rows.length);
  }
  // revenue matrix
  {
    const ws = wb.getWorksheet("Revenue Matrix"); let yearRow = null;
    ws.eachRow((row, r) => { if (yearRow) return; if ((asStr(cell(row, 1)) || "").toLowerCase() === "year") yearRow = r; });
    const rows = [];
    if (yearRow) {
      const header = ws.getRow(yearRow); const years = [];
      for (let c = 2; c <= 20; c++) { const y = asNum(cell(header, c)); if (y && y >= 2015 && y <= 2100) years.push({ col: c, year: Math.round(y) }); }
      const fieldByLabel = { existing: "existing_rev", new: "new_rev", replacent: "replacement", replacement: "replacement", churn: "churn", "ending rev": "ending_rev" };
      const byYear = new Map(); years.forEach(({ year }) => byYear.set(year, { year, existing_rev: null, new_rev: null, replacement: null, churn: null, ending_rev: null }));
      // The sheet stacks a Revenue ($) block and an Accounts (counts) block with identical
      // row labels — keep the FIRST occurrence (revenue dollars), ignore the later counts block.
      ws.eachRow((row, r) => { if (r <= yearRow) return; const label = (asStr(cell(row, 1)) || "").toLowerCase(); const field = fieldByLabel[label]; if (!field) return; for (const { col, year } of years) { const v = asNum(cell(row, col)); if (v !== null && byYear.get(year)[field] === null) byYear.get(year)[field] = v; } });
      for (const v of byYear.values()) if (v.existing_rev !== null || v.ending_rev !== null) rows.push(`(${v.year},${n(v.existing_rev)},${n(v.new_rev)},${n(v.replacement)},${n(v.churn)},${n(v.ending_rev)})`);
    }
    if (rows.length) stmts.push(`insert into revenue_matrix (year,existing_rev,new_rev,replacement,churn,ending_rev) values\n${rows.join(",\n")}\non conflict (year) do update set existing_rev=excluded.existing_rev,new_rev=excluded.new_rev,replacement=excluded.replacement,churn=excluded.churn,ending_rev=excluded.ending_rev;`);
    console.log("revenue_matrix:", rows.length);
  }
  writeFileSync(`${OUT}/05_debt_revenue.sql`, stmts.join("\n\n"));
}
console.log("Wrote SQL to", OUT);
