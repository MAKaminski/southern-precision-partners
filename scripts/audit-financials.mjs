#!/usr/bin/env node
// Consistency audit for the hardcoded deal-model figures in src/lib/data.ts.
// Every number on the site is hand-entered, so subtotals can silently drift
// from the line items that feed them. This script re-derives each subtotal
// from its own inputs and fails loudly when they disagree.
//
// Run: npm run audit:financials

import { pathToFileURL } from "node:url";
import path from "node:path";

const dataUrl = pathToFileURL(path.resolve(process.cwd(), "src/lib/data.ts")).href;
const data = await import(dataUrl);

const failures = [];
const TOLERANCE_ABS = 1; // dollars — rounds out floating point noise only
const TOLERANCE_PCT = 0.02; // 2% — for values derived from rounded display strings

function fail(section, detail) {
  failures.push({ section, detail });
}

function near(a, b, { abs = TOLERANCE_ABS, pct = TOLERANCE_PCT } = {}) {
  return Math.abs(a - b) <= Math.max(abs, Math.abs(b) * pct);
}

function parseMoney(str) {
  const m = /\$([\d.]+)\s*([MK]?)/i.exec(str);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const mult = m[2].toUpperCase() === "M" ? 1_000_000 : m[2].toUpperCase() === "K" ? 1_000 : 1;
  return n * mult;
}

function parseMultiple(str) {
  const m = /([\d.]+)\s*×/.exec(str);
  return m ? parseFloat(m[1]) : null;
}

// ── Income statement reconciliation ─────────────────────────────────────
function auditIncomeStatement(name, rows) {
  const row = (label) => rows.find((r) => r.label === label);
  const ebitda = row("EBITDA");
  const lp = row("LP Interest (10% IO)");
  const sn = row("Seller Note (P&I)");
  const cr = row("Capital Reserve");
  const tax = row("Est. Taxes (25%)");
  const fcf = row("Distributable FCF");
  const gp = rows.find((r) => r.label.startsWith("→ GP"));
  const jp = rows.find((r) => r.label.startsWith("→ JP"));
  if (!ebitda || !lp || !sn || !cr || !tax || !fcf || !gp || !jp) {
    fail(name, "Expected row labels not found — table structure changed, audit needs updating");
    return;
  }
  for (let i = 0; i < fcf.values.length; i++) {
    const computed = ebitda.values[i] + lp.values[i] + sn.values[i] + cr.values[i] + tax.values[i];
    if (!near(fcf.values[i], computed)) {
      fail(
        name,
        `Yr${i + 1}: "Distributable FCF" shows $${fcf.values[i].toLocaleString()} but EBITDA − LP interest − seller note − reserve − taxes = $${computed.toLocaleString()} (diff $${(fcf.values[i] - computed).toLocaleString()})`
      );
    }
    const distributed = gp.values[i] + jp.values[i];
    if (!near(fcf.values[i], distributed)) {
      fail(
        name,
        `Yr${i + 1}: GP + JP distributions ($${distributed.toLocaleString()}) don't sum to "Distributable FCF" ($${fcf.values[i].toLocaleString()}), diff $${(fcf.values[i] - distributed).toLocaleString()}`
      );
    }
  }
}

auditIncomeStatement("incomeStatementPreInitiative", data.incomeStatementPreInitiative);
auditIncomeStatement("incomeStatementPostInitiative", data.incomeStatementPostInitiative);

// ── Cap stack ────────────────────────────────────────────────────────────
{
  const sumAmounts = data.capStack.reduce((s, t) => s + t.amount, 0);
  if (!near(sumAmounts, data.totalRaise)) {
    fail("capStack", `Tranche amounts sum to $${sumAmounts.toLocaleString()}, not totalRaise $${data.totalRaise.toLocaleString()}`);
  }
  const sumPct = data.capStack.reduce((s, t) => s + t.pct, 0);
  if (!near(sumPct, 100, { abs: 0.2, pct: 0 })) {
    fail("capStack", `Tranche percentages sum to ${sumPct}%, not 100%`);
  }
  for (const t of data.capStack) {
    const impliedPct = (t.amount / data.totalRaise) * 100;
    if (!near(t.pct, impliedPct, { abs: 0.15, pct: 0 })) {
      fail("capStack", `${t.name}: labeled ${t.pct}% but amount/totalRaise = ${impliedPct.toFixed(2)}%`);
    }
  }
}

// ── Uses of funds ────────────────────────────────────────────────────────
{
  const sum = data.usesOfFunds.reduce((s, u) => s + u.amount, 0);
  if (!near(sum, data.totalRaise)) {
    fail("usesOfFunds", `Line items sum to $${sum.toLocaleString()}, not totalRaise $${data.totalRaise.toLocaleString()}`);
  }
}

// ── EBITDA margins ───────────────────────────────────────────────────────
function auditMargins(name, years) {
  for (const y of years) {
    const implied = (y.ebitda / y.revenue) * 100;
    if (!near(y.ebitdaMargin, implied, { abs: 0.15, pct: 0 })) {
      fail(name, `${y.year}: labeled margin ${y.ebitdaMargin}% but ebitda/revenue = ${implied.toFixed(2)}%`);
    }
  }
}
auditMargins("financialYearsPreInitiative", data.financialYearsPreInitiative);
auditMargins("financialYearsPostInitiative", data.financialYearsPostInitiative);

// ── Investor return MOICs ───────────────────────────────────────────────
for (const r of data.investorReturns) {
  const invested = parseMoney(r.invested);
  const proceeds = parseMoney(r.proceeds);
  const moic = parseMultiple(r.moic);
  if (invested && proceeds && moic) {
    const implied = proceeds / invested;
    if (!near(moic, implied, { abs: 0, pct: 0.03 })) {
      fail("investorReturns", `${r.title}: labeled MOIC ${moic}× but proceeds/invested = ${implied.toFixed(2)}×`);
    }
  }
}

// ── Full scenario MOICs (LP/MP/JP invested amounts held constant across scenarios) ──
{
  const lpInvested = parseMoney(data.investorReturns.find((r) => r.title.startsWith("LP")).invested);
  const mpInvested = parseMoney(data.investorReturns.find((r) => r.title.startsWith("Managing Partner")).invested);
  const jpInvested = parseMoney(data.investorReturns.find((r) => r.title.startsWith("Junior Partner")).invested);
  const investedByRole = { lp: lpInvested, mp: mpInvested, jp: jpInvested };
  for (const s of data.fullScenarios) {
    for (const role of ["lp", "mp", "jp"]) {
      const proceeds = parseMoney(s[role].proceeds);
      const moic = parseMultiple(s[role].moic);
      const invested = investedByRole[role];
      if (proceeds && moic && invested) {
        const implied = proceeds / invested;
        if (!near(moic, implied, { abs: 0, pct: 0.03 })) {
          fail(
            "fullScenarios",
            `${s.name}/${role}: labeled MOIC ${moic}× but proceeds/invested = ${implied.toFixed(2)}×`
          );
        }
      }
    }
  }
}

// ── Sensitivity matrix anchor cell ──────────────────────────────────────
{
  const cell = data.sensitivityMoicMatrix[data.sensitivityBaseRow][data.sensitivityBaseCol];
  if (cell === undefined) {
    fail("sensitivityMoicMatrix", `sensitivityBaseRow/Col (${data.sensitivityBaseRow}, ${data.sensitivityBaseCol}) is out of bounds`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────
if (failures.length === 0) {
  console.log("✅ audit-financials: all checks passed — every displayed subtotal reconciles with its inputs.");
  process.exit(0);
} else {
  console.error(`❌ audit-financials: ${failures.length} inconsistency(ies) found in src/lib/data.ts\n`);
  for (const f of failures) {
    console.error(`  [${f.section}] ${f.detail}`);
  }
  console.error("\nThese are investor/lender-facing figures — have a human confirm the intended values before editing src/lib/data.ts.");
  process.exit(1);
}
