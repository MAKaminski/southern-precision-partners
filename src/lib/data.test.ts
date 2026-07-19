import { test } from "node:test";
import assert from "node:assert/strict";
import {
  financialYearsPreInitiative,
  financialYearsPostInitiative,
  incomeStatementPreInitiative,
  incomeStatementPostInitiative,
  incomeStatementYears,
  scenario1CashFlows,
  scenario2CashFlows,
} from "./data.ts";

const TAX_RATE = 0.25;
const DOLLAR_TOLERANCE = 2; // rounding slack from hand-computed hardcoded figures
const MARGIN_TOLERANCE = 0.1; // percentage points

function findRow(rows: typeof incomeStatementPreInitiative, label: string) {
  const row = rows.find((r) => r.label === label);
  assert.ok(row, `expected a "${label}" row`);
  return row.values;
}

test("EBITDA margin matches ebitda / revenue for every projected year", () => {
  for (const years of [financialYearsPreInitiative, financialYearsPostInitiative]) {
    for (const y of years) {
      const impliedMargin = (y.ebitda / y.revenue) * 100;
      assert.ok(
        Math.abs(impliedMargin - y.ebitdaMargin) <= MARGIN_TOLERANCE,
        `${y.year}: stated margin ${y.ebitdaMargin}% but ebitda/revenue implies ${impliedMargin.toFixed(2)}%`
      );
    }
  }
});

for (const [label, flows] of [
  ["scenario1CashFlows", scenario1CashFlows],
  ["scenario2CashFlows", scenario2CashFlows],
] as const) {
  test(`${label}: distributable FCF reconciles with EBITDA, debt service, reserves, and taxes`, () => {
    for (const f of flows) {
      const pretax = f.ebitda + f.lpInterest + f.sellerNote + f.capitalReserve;
      const impliedTax = -pretax * TAX_RATE;
      assert.ok(
        Math.abs(impliedTax - f.taxes) <= DOLLAR_TOLERANCE,
        `${f.year}: taxes ${f.taxes} should be ~25% of pretax FCF ${pretax} (expected ~${impliedTax.toFixed(0)})`
      );

      const impliedFCF = pretax + f.taxes;
      assert.ok(
        Math.abs(impliedFCF - f.distributableFCF) <= DOLLAR_TOLERANCE,
        `${f.year}: distributableFCF ${f.distributableFCF} does not equal EBITDA - debt service - reserve - taxes (${impliedFCF})`
      );

      const payout = f.managingMember + f.juniorPartner + (f.seniorLPEquity ?? 0);
      assert.ok(
        Math.abs(payout - f.distributableFCF) <= DOLLAR_TOLERANCE,
        `${f.year}: partner payouts (${payout}) do not sum to distributableFCF (${f.distributableFCF})`
      );
    }
  });
}

for (const [label, rows] of [
  ["incomeStatementPreInitiative", incomeStatementPreInitiative],
  ["incomeStatementPostInitiative", incomeStatementPostInitiative],
] as const) {
  test(`${label}: header rows reconcile across every year`, () => {
    const ebitda = findRow(rows, "EBITDA");
    const lpInterest = findRow(rows, rows === incomeStatementPreInitiative ? "LP Interest (10% IO)" : "LP Interest (10% IO)");
    const sellerNote = findRow(rows, "Seller Note (P&I)");
    const capitalReserve = findRow(rows, "Capital Reserve");
    const taxes = findRow(rows, "Est. Taxes (25%)");
    const distributableFCF = findRow(rows, "Distributable FCF");
    const gp = findRow(rows, rows.find((r) => r.label.startsWith("→ GP"))!.label);
    const jp = findRow(rows, rows.find((r) => r.label.startsWith("→ JP"))!.label);

    incomeStatementYears.forEach((year, i) => {
      const pretax = ebitda[i]! + lpInterest[i]! + sellerNote[i]! + capitalReserve[i]!;
      const impliedFCF = pretax + taxes[i]!;
      assert.ok(
        Math.abs(impliedFCF - distributableFCF[i]!) <= DOLLAR_TOLERANCE,
        `${label} ${year}: Distributable FCF row (${distributableFCF[i]}) does not equal EBITDA - debt service - reserve - taxes (${impliedFCF})`
      );

      const payout = gp[i]! + jp[i]!;
      assert.ok(
        Math.abs(payout - distributableFCF[i]!) <= distributableFCF[i]! * 0.06,
        `${label} ${year}: GP + JP payout (${payout}) should reconcile with Distributable FCF (${distributableFCF[i]}), allowing for the LP equity-kicker share`
      );
    });
  });
}
