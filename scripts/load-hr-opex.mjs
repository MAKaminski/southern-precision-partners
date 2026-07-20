/**
 * One-off (idempotent) loader: Mosaic.xlsx (the richer workbook version
 * uploaded 2026-07-20, distinct from the original Mosaic_1.xlsx that
 * scripts/load-mosaic.mjs reads) -> hr_employees / hr_employee_plan_details
 * / forecast_opex_gl.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/load-hr-opex.mjs /path/to/Mosaic.xlsx
 *
 * Reads:
 *   - "USER GOALS" rows 39-51 (a Live Oak lender payroll request, named
 *     employees, 01/01/2026-05/31/2026) -> hr_employees + hr_employee_plan_details
 *     (plan='current'). Re-running deletes and re-inserts rows tagged
 *     source='mosaic_payroll_2026' so this stays idempotent without needing
 *     a uniqueness constraint on full_name.
 *   - "OpEx QOE" rows 8-40 (real GL-level OpEx line items, 2022-2031) ->
 *     forecast_opex_gl (scenario='forecast'), upserting on the table's
 *     existing (scenario, gl_category, year) unique key. Only the
 *     'forecast' scenario has a QOE breakdown in the source; 'plan' keeps
 *     its Unclassified-total placeholder from migration 0006 until a
 *     plan-level GL breakdown exists.
 *
 * Does NOT touch every other new sheet in this workbook (Marketing &
 * Growth funnel, Revenue Matrix_Monthly, Deal Financing, BS, etc.) — this
 * loader is scoped to the two sheets that directly answer the HR and
 * Forecast OpEx GL asks. Those other sheets are real and substantial; a
 * separate loader is the right next step if/when that work is scoped.
 */
import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

const proxyUri = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUri) {
  const { setGlobalDispatcher, ProxyAgent } = await import("undici");
  const caPath = process.env.NODE_EXTRA_CA_CERTS;
  const ca = caPath ? readFileSync(caPath) : undefined;
  setGlobalDispatcher(new ProxyAgent({ uri: proxyUri, requestTls: ca ? { ca } : undefined }));
}

const XLSX_PATH = process.argv[2];
if (!XLSX_PATH) {
  console.error("FATAL: pass the workbook path as an argument");
  process.exit(1);
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yscxrvuwwfpjuciuawcv.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error("FATAL: set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(URL, KEY, { auth: { persistSession: false } });

const unwrap = (v) => (v && typeof v === "object" && "result" in v ? v.result : v);
function asNum(v) {
  v = unwrap(v);
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function asStr(v) {
  v = unwrap(v);
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

const PAYROLL_SOURCE = "mosaic_payroll_2026";

function departmentFor(title) {
  const t = title.toUpperCase();
  if (t.includes("PRESIDENT") || t.includes("SEC/TRES")) return "Executive";
  if (t.includes("BOOKKEEPER")) return "Finance";
  if (t.includes("WAREHOUSE")) return "Warehouse";
  if (t.includes("SALES")) return "Sales";
  return null;
}

async function loadPayroll(sheet) {
  const rows = [];
  for (let r = 39; r <= 51; r++) {
    const [name, title, gross5mo, k401, netPay, annualized, note] = sheet.getRow(r).values.slice(1).map(unwrap);
    if (!asStr(name) || !asStr(title) || asNum(annualized) === null) continue;
    rows.push({ name: asStr(name), title: asStr(title), gross5mo: asNum(gross5mo), k401: asNum(k401), netPay: asNum(netPay), annualized: asNum(annualized), note: asStr(note) });
  }
  if (rows.length === 0) { console.log("USER GOALS payroll: no rows found, skipping"); return; }

  const { error: delEmpErr } = await db.from("hr_employees").delete().eq("source", PAYROLL_SOURCE);
  if (delEmpErr) throw delEmpErr;

  for (const row of rows) {
    const { data: emp, error: insErr } = await db
      .from("hr_employees")
      .insert({ full_name: row.name, source: PAYROLL_SOURCE })
      .select()
      .single();
    if (insErr) throw insErr;

    const notes = [
      `Source: Live Oak lender payroll request #7, 01/01/2026-05/31/2026 (5mo). Gross (5mo) $${row.gross5mo}, 401(k) $${row.k401 ?? 0}, Net Pay (5mo) $${row.netPay}.`,
      row.note,
    ].filter(Boolean).join(" ");

    const { error: planErr } = await db.from("hr_employee_plan_details").insert({
      employee_id: emp.id,
      plan: "current",
      role_title: row.title,
      department: departmentFor(row.title),
      employment_type: "full_time", // not stated in source; inferred from consistent monthly payroll cadence
      status: "active",
      pay_type: "salary",
      pay_rate: row.annualized,
      annualized_cost: row.annualized,
      change_type: "unchanged",
      effective_date: "2026-05-31",
      notes,
    });
    if (planErr) throw planErr;
  }
  console.log(`hr_employees / hr_employee_plan_details: loaded ${rows.length} employees`);
}

async function loadOpexGl(sheet) {
  const years = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];
  const upserts = [];
  for (let r = 8; r <= 40; r++) {
    const rowVals = sheet.getRow(r).values.slice(1).map(unwrap);
    const label = asStr(rowVals[0]);
    if (!label) continue;
    years.forEach((y, i) => {
      upserts.push({ scenario: "forecast", gl_category: label, year: y, value: asNum(rowVals[i + 1]), sort_order: r - 7 });
    });
  }
  if (upserts.length === 0) { console.log("OpEx QOE: no rows found, skipping"); return; }

  const { error } = await db.from("forecast_opex_gl").upsert(upserts, { onConflict: "scenario,gl_category,year" });
  if (error) throw error;
  console.log(`forecast_opex_gl: upserted ${upserts.length} (scenario, gl_category, year) rows`);
}

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX_PATH);

await loadPayroll(wb.getWorksheet("USER GOALS"));
await loadOpexGl(wb.getWorksheet("OpEx QOE"));

console.log("Done.");
