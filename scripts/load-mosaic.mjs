/**
 * One-off (idempotent) loader: Mosaic_1.xlsx  ->  Southern Precision Partners Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/load-mosaic.mjs /path/to/Mosaic_1.xlsx
 *
 * Reads:
 *   - Customer_Data, SUMMARY 24/25/26, 2024/2025/2026 AR  -> customers, customer_annual_sales, ar_transactions
 *   - Delivery Plan  -> delivery_tasks       (seeded only if table empty; preserves in-app edits)
 *   - Forecast, Plan -> forecast_pnl         (seed-if-empty)
 *   - Summary        -> debt_schedule        (seed-if-empty)
 *   - Revenue Matrix -> revenue_matrix        (seed-if-empty)
 *
 * customers / customer_annual_sales / ar_transactions upsert on natural keys, so
 * re-running is safe and non-duplicating.
 */
import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

const XLSX_PATH =
  process.argv[2] ||
  "/root/.claude/uploads/3781f327-7d4c-5828-a4a2-ec1070370af4/56ae28aa-Mosaic_1.xlsx";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yscxrvuwwfpjuciuawcv.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error("FATAL: set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(URL, KEY, { auth: { persistSession: false } });

// ---------- cell helpers ----------
const unwrap = (v) => (v && typeof v === "object" && "result" in v ? v.result : v);
function cellVal(cell) {
  return unwrap(cell?.value);
}
function asNum(v) {
  v = unwrap(v);
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = parseFloat(String(v).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function asStr(v) {
  v = unwrap(v);
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
function nameKey(v) {
  const s = asStr(v);
  if (!s) return null;
  return s.replace(/\s+/g, " ").trim().toUpperCase();
}
function mdyToISO(m, d, y) {
  m = asNum(m); d = asNum(d); y = asNum(y);
  if (!m || !d || !y) return null;
  if (y < 100) y += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
// Delivery Plan dates arrive as JS Date, or "7/19/26", or "1/1/2027"
function anyDateToISO(v) {
  v = unwrap(v);
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) return mdyToISO(m[1], m[2], m[3]);
  const iso = s.match(/^\d{4}-\d{2}-\d{2}/);
  return iso ? s.slice(0, 10) : null;
}
async function chunkInsert(table, rows, { onConflict } = {}) {
  let n = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const q = onConflict
      ? db.from(table).upsert(batch, { onConflict, ignoreDuplicates: false })
      : db.from(table).insert(batch);
    const { error } = await q;
    if (error) { console.error(`  ! ${table} batch @${i}:`, error.message); throw error; }
    n += batch.length;
  }
  return n;
}
async function isEmpty(table) {
  const { count, error } = await db.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return (count ?? 0) === 0;
}

// ---------- main ----------
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX_PATH);
console.log(`Loaded workbook: ${XLSX_PATH}`);

// ===== 1) Customer master (union of Customer_Data + SUMMARY + AR names) =====
// value carriers keyed by name_key
const master = new Map(); // name_key -> { name, name_key, customer_code, alias }
function touch(nameRaw, code) {
  const key = nameKey(nameRaw);
  if (!key) return null;
  let rec = master.get(key);
  if (!rec) { rec = { name: asStr(nameRaw), name_key: key, customer_code: null, alias: null }; master.set(key, rec); }
  if (code && !rec.customer_code) rec.customer_code = asStr(code);
  return rec;
}

// Customer_Data: header row 3, data 4+, B=name C=alias
const cd = wb.getWorksheet("Customer_Data");
cd.eachRow((row, r) => {
  if (r < 4) return;
  const rec = touch(cellVal(row.getCell(2)));
  if (rec) { const a = asStr(cellVal(row.getCell(3))); if (a) rec.alias = a; }
});

// SUMMARY tabs: header row 1, data 2+, B=name, C=<year value>
const SUMMARY = { 2024: "SUMMARY 24", 2025: "SUMMARY 25", 2026: "SUMMARY 26" };
const annualByKey = new Map(); // name_key -> {year: sales}
for (const [year, sheet] of Object.entries(SUMMARY)) {
  const ws = wb.getWorksheet(sheet);
  ws.eachRow((row, r) => {
    if (r < 2) return;
    const rec = touch(cellVal(row.getCell(2)));
    const sales = asNum(cellVal(row.getCell(3)));
    if (rec && sales !== null) {
      if (!annualByKey.has(rec.name_key)) annualByKey.set(rec.name_key, {});
      annualByKey.get(rec.name_key)[year] = (annualByKey.get(rec.name_key)[year] || 0) + sales;
    }
  });
}

// AR tabs: A=code(sparse) B=name C/D/E=inv m/d/y F=inv# G=inv amt H=pay ref I/J/K=pay m/d/y L=pay amt M=neg N=bal
const AR = { 2024: "2024 AR", 2025: "2025 AR", 2026: "2026 AR" };
const arRows = []; // staged; customer_id filled after master upsert
const arAgg = new Map(); // name_key -> {invSum,paySum,invCnt,payCnt,firstD,lastD}
for (const [year, sheet] of Object.entries(AR)) {
  const ws = wb.getWorksheet(sheet);
  ws.eachRow((row, r) => {
    const nameRaw = cellVal(row.getCell(2));
    const key = nameKey(nameRaw);
    if (!key) return;
    const code = cellVal(row.getCell(1));
    touch(nameRaw, code);

    const invDate = mdyToISO(cellVal(row.getCell(3)), cellVal(row.getCell(4)), cellVal(row.getCell(5)));
    const invNumRaw = cellVal(row.getCell(6));
    const invAmtRaw = asNum(cellVal(row.getCell(7)));
    const payRef = asStr(cellVal(row.getCell(8)));
    const payDate = mdyToISO(cellVal(row.getCell(9)), cellVal(row.getCell(10)), cellVal(row.getCell(11)));
    const payAmtRaw = asNum(cellVal(row.getCell(12)));
    const bal = asNum(cellVal(row.getCell(14)));

    const invAmt = invAmtRaw === null ? null : Math.abs(invAmtRaw);
    const payAmt = payAmtRaw === null ? null : Math.abs(payAmtRaw);
    const isCredit = !!(payRef && /^LC/i.test(payRef));

    // skip rows with no financial or date signal at all
    if (invAmt === null && payAmt === null && !invDate && !payDate) return;

    const line_key = [year, key, asStr(invNumRaw) ?? "", invAmtRaw ?? "", payRef ?? "", payAmtRaw ?? "", invDate ?? "", payDate ?? ""].join("|");
    arRows.push({
      _key: key, year: Number(year), invoice_date: invDate, invoice_number: asStr(invNumRaw),
      invoice_amount: invAmt, payment_ref: payRef, payment_date: payDate, payment_amount: payAmt,
      running_balance: bal, is_credit_memo: isCredit, line_key,
      raw: { row: r, sheet, values: row.values.map((x) => (x === undefined ? null : unwrap(x))) },
    });

    let agg = arAgg.get(key);
    if (!agg) { agg = { invSum: 0, paySum: 0, invCnt: 0, payCnt: 0, firstD: null, lastD: null }; arAgg.set(key, agg); }
    if (invAmt !== null && !isCredit) { agg.invSum += invAmt; agg.invCnt += 1; }
    if (payAmt !== null) { agg.paySum += payAmt; agg.payCnt += 1; }
    const d = invDate || payDate;
    if (d) { if (!agg.firstD || d < agg.firstD) agg.firstD = d; if (!agg.lastD || d > agg.lastD) agg.lastD = d; }
  });
}

// Build customer upsert rows with derived lifetime metrics
function segmentFor(s) { return s >= 100000 ? "top" : s >= 25000 ? "mid" : "tail"; }
const customerRows = [];
for (const rec of master.values()) {
  const annual = annualByKey.get(rec.name_key) || {};
  const lifetime_sales = Object.values(annual).reduce((a, b) => a + b, 0);
  const agg = arAgg.get(rec.name_key) || { invSum: 0, paySum: 0, invCnt: 0, payCnt: 0, firstD: null, lastD: null };
  customerRows.push({
    customer_code: rec.customer_code,
    name: rec.name,
    name_key: rec.name_key,
    alias: rec.alias,
    first_sale_date: agg.firstD,
    last_sale_date: agg.lastD,
    lifetime_sales: Math.round(lifetime_sales * 100) / 100,
    lifetime_sale_count: agg.invCnt,
    lifetime_payments: Math.round(agg.paySum * 100) / 100,
    lifetime_payment_count: agg.payCnt,
    balance: Math.round((agg.invSum - agg.paySum) * 100) / 100,
    segment: segmentFor(lifetime_sales),
    source: "mosaic_xlsx",
  });
}
console.log(`Customers: ${customerRows.length} (from ${master.size} name keys)`);
await chunkInsert("customers", customerRows, { onConflict: "name_key" });

// fetch id map
const idByKey = new Map();
{
  let from = 0;
  for (;;) {
    const { data, error } = await db.from("customers").select("id,name_key").range(from, from + 999);
    if (error) throw error;
    data.forEach((c) => idByKey.set(c.name_key, c.id));
    if (data.length < 1000) break;
    from += 1000;
  }
}

// annual sales
const annualRows = [];
for (const [key, byYear] of annualByKey.entries()) {
  const cid = idByKey.get(key);
  if (!cid) continue;
  for (const [year, sales] of Object.entries(byYear)) {
    annualRows.push({ customer_id: cid, year: Number(year), sales: Math.round(sales * 100) / 100 });
  }
}
console.log(`Annual sales rows: ${annualRows.length}`);
await chunkInsert("customer_annual_sales", annualRows, { onConflict: "customer_id,year" });

// AR
let arSkipNoCust = 0;
const arFinal = [];
const seenLineKey = new Set();
for (const t of arRows) {
  const cid = idByKey.get(t._key);
  if (!cid) { arSkipNoCust++; continue; }
  if (seenLineKey.has(t.line_key)) continue; // in-file dupe guard
  seenLineKey.add(t.line_key);
  const rest = { ...t };
  delete rest._key;
  arFinal.push({ ...rest, customer_id: cid });
}
console.log(`AR transactions: ${arFinal.length} (skipped ${arSkipNoCust} w/o customer, ${arRows.length - arFinal.length - arSkipNoCust} in-file dupes)`);
await chunkInsert("ar_transactions", arFinal, { onConflict: "line_key" });

// ===== 2) delivery_tasks (seed-if-empty) =====
if (await isEmpty("delivery_tasks")) {
  const ws = wb.getWorksheet("Delivery Plan");
  const rows = [];
  ws.eachRow((row, r) => {
    if (r < 2) return;
    const title = asStr(cellVal(row.getCell(8)));
    const dyear = asNum(cellVal(row.getCell(1)));
    if (!title || /^TOTAL/i.test(title) || dyear === null) return; // skip totals/blank
    rows.push({
      delivery_year: Math.round(dyear),
      item: asNum(cellVal(row.getCell(2))),
      task: asNum(cellVal(row.getCell(3))),
      system: asStr(cellVal(row.getCell(4))),
      rank: asNum(cellVal(row.getCell(5))),
      start_date: anyDateToISO(cellVal(row.getCell(6))),
      end_date: anyDateToISO(cellVal(row.getCell(7))),
      title,
      next_step: asStr(cellVal(row.getCell(9))),
      owner: asStr(cellVal(row.getCell(10))),
      cost_k: asNum(cellVal(row.getCell(11))),
      benefit_k: asNum(cellVal(row.getCell(12))),
      status: "not_started",
      sort_order: r,
    });
  });
  console.log(`Delivery tasks: ${rows.length}`);
  await chunkInsert("delivery_tasks", rows);
} else console.log("delivery_tasks not empty — skipped seed");

// ===== 3) forecast_pnl (Forecast + Plan) (seed-if-empty) =====
if (await isEmpty("forecast_pnl")) {
  const rows = [];
  for (const [scenario, sheet] of [["forecast", "Forecast"], ["plan", "Plan"]]) {
    const ws = wb.getWorksheet(sheet);
    const header = ws.getRow(1);
    const years = [];
    for (let c = 2; c <= 20; c++) {
      const y = asNum(cellVal(header.getCell(c)));
      if (y && y >= 2015 && y <= 2100) years.push({ col: c, year: Math.round(y) });
    }
    ws.eachRow((row, r) => {
      if (r < 2) return;
      const category = asStr(cellVal(row.getCell(1)));
      if (!category) return;
      const is_percent = /%/.test(category);
      for (const { col, year } of years) {
        const val = asNum(cellVal(row.getCell(col)));
        if (val === null) continue;
        rows.push({ scenario, category, year, value: val, is_percent, sort_order: r });
      }
    });
  }
  console.log(`Forecast P&L rows: ${rows.length}`);
  await chunkInsert("forecast_pnl", rows, { onConflict: "scenario,category,year" });
} else console.log("forecast_pnl not empty — skipped seed");

// ===== 4) debt_schedule from Summary (seed-if-empty) =====
if (await isEmpty("debt_schedule")) {
  const ws = wb.getWorksheet("Summary");
  const header = ws.getRow(1);
  const years = [];
  for (let c = 2; c <= 20; c++) {
    const y = asNum(cellVal(header.getCell(c)));
    if (y && y >= 2015 && y <= 2100) years.push({ col: c, year: Math.round(y) });
  }
  // scan labeled rows; assign to facility by nearest 'SBA'/'Seller Note' section header
  let facility = null;
  const byFacYear = new Map(); // `${fac}|${year}` -> {principal,interest,ending}
  ws.eachRow((row, r) => {
    const label = (asStr(cellVal(row.getCell(1))) || "").toLowerCase();
    if (!label) return;
    if (label.includes("seller note")) facility = "Seller Note";
    else if (label.includes("debt servicing") || label.includes("sba")) facility = "SBA";
    if (!facility) return;
    let field = null;
    if (label === "principal") field = "principal";
    else if (label === "interest") field = "interest";
    else if (label.startsWith("ending")) field = "ending_balance";
    if (!field) return;
    for (const { col, year } of years) {
      const v = asNum(cellVal(row.getCell(col)));
      if (v === null) continue;
      const k = `${facility}|${year}`;
      if (!byFacYear.has(k)) byFacYear.set(k, { facility, year, principal: null, interest: null, ending_balance: null });
      byFacYear.get(k)[field] = v;
    }
  });
  const rows = [...byFacYear.values()];
  console.log(`Debt schedule rows: ${rows.length}`);
  if (rows.length) await chunkInsert("debt_schedule", rows, { onConflict: "facility,year" });
} else console.log("debt_schedule not empty — skipped seed");

// ===== 5) revenue_matrix (seed-if-empty) =====
if (await isEmpty("revenue_matrix")) {
  const ws = wb.getWorksheet("Revenue Matrix");
  // find the 'Year' header row within the Revenue Matrix block
  let yearRow = null;
  ws.eachRow((row, r) => {
    if (yearRow) return;
    if ((asStr(cellVal(row.getCell(1))) || "").toLowerCase() === "year") yearRow = r;
  });
  const rows = [];
  if (yearRow) {
    const header = ws.getRow(yearRow);
    const years = [];
    for (let c = 2; c <= 20; c++) {
      const y = asNum(cellVal(header.getCell(c)));
      if (y && y >= 2015 && y <= 2100) years.push({ col: c, year: Math.round(y) });
    }
    const fieldByLabel = { existing: "existing_rev", new: "new_rev", replacent: "replacement", replacement: "replacement", churn: "churn", "ending rev": "ending_rev" };
    const byYear = new Map();
    years.forEach(({ year }) => byYear.set(year, { year, existing_rev: null, new_rev: null, replacement: null, churn: null, ending_rev: null }));
    ws.eachRow((row, r) => {
      if (r <= yearRow) return;
      const label = (asStr(cellVal(row.getCell(1))) || "").toLowerCase();
      const field = fieldByLabel[label];
      if (!field) return;
      for (const { col, year } of years) {
        const v = asNum(cellVal(row.getCell(col)));
        if (v !== null) byYear.get(year)[field] = v;
      }
    });
    for (const v of byYear.values()) {
      if (v.existing_rev !== null || v.ending_rev !== null) rows.push(v);
    }
  }
  console.log(`Revenue matrix rows: ${rows.length}`);
  if (rows.length) await chunkInsert("revenue_matrix", rows, { onConflict: "year" });
} else console.log("revenue_matrix not empty — skipped seed");

// ===== reconciliation =====
async function sumCol(table, col, filter) {
  let q = db.from(table).select(col);
  if (filter) q = filter(q);
  const { data, error } = await q;
  if (error) throw error;
  return data.reduce((a, r) => a + (Number(r[col]) || 0), 0);
}
console.log("\n=== reconciliation ===");
for (const y of [2024, 2025, 2026]) {
  const s = await sumCol("customer_annual_sales", "sales", (q) => q.eq("year", y));
  console.log(`  SUMMARY ${y} total sales loaded: ${s.toLocaleString()}`);
}
console.log("Done.");
