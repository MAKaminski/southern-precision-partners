// Automated regression tests for the investor-facing financial model in
// data.ts. This repo has repeatedly shipped silent arithmetic drift to
// production (Seller Note $200K vs $300K, a $23,200/yr tax/FCF mismatch) —
// these tests turn those failure modes into a `npm test` that fails loudly
// instead of a bug someone notices on the live deal page.
//
// Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import {
  capStack,
  totalRaise,
  usesOfFunds,
  debtFacilities,
  financialYearsPreInitiative,
  financialYearsPostInitiative,
  ebitdaBridge,
  scenario1CashFlows,
  scenario2CashFlows,
  incomeStatementPreInitiative,
  incomeStatementPostInitiative,
  incomeStatementYears,
  sensitivityMoicMatrix,
  sensitivityBaseRow,
  sensitivityBaseCol,
} from "./data.ts";

const DOLLAR_TOLERANCE = 2; // source figures are hand-rounded to the dollar
const PCT_TOLERANCE = 0.15; // cap-stack/margin percentages rounded to 1 decimal

test("capStack tranches sum to totalRaise", () => {
  const sum = capStack.reduce((acc, t) => acc + t.amount, 0);
  assert.ok(
    Math.abs(sum - totalRaise) <= DOLLAR_TOLERANCE,
    `capStack sums to ${sum}, expected totalRaise ${totalRaise}`
  );
});

test("capStack pct fields match amount / totalRaise", () => {
  for (const tranche of capStack) {
    const expectedPct = (tranche.amount / totalRaise) * 100;
    assert.ok(
      Math.abs(tranche.pct - expectedPct) <= PCT_TOLERANCE,
      `${tranche.name}: pct ${tranche.pct} != expected ${expectedPct.toFixed(1)}`
    );
  }
});

test("usesOfFunds sums to totalRaise", () => {
  const sum = usesOfFunds.reduce((acc, u) => acc + u.amount, 0);
  assert.ok(
    Math.abs(sum - totalRaise) <= DOLLAR_TOLERANCE,
    `usesOfFunds sums to ${sum}, expected totalRaise ${totalRaise}`
  );
});

test("SBA Term Loan and Seller Note amounts match between capStack and debtFacilities", () => {
  const sbaTranche = capStack.find((t) => t.name.includes("SBA Term Loan"));
  const sellerTranche = capStack.find((t) => t.name === "Seller Note");
  const sbaFacility = debtFacilities.find((f) => f.name === "SBA Term Loan");
  const sellerFacility = debtFacilities.find((f) => f.name === "Seller Note");

  assert.ok(sbaTranche && sbaFacility, "SBA Term Loan missing from capStack or debtFacilities");
  assert.ok(sellerTranche && sellerFacility, "Seller Note missing from capStack or debtFacilities");

  // debtFacilities stores amounts as display strings like "$2.24M" / "$280K" —
  // parse back to a number so this can't silently drift like the old
  // $200K vs $300K Seller Note bug.
  const parseDisplayAmount = (s: string) => {
    const m = s.match(/\$([\d.]+)(K|M)/);
    if (!m) throw new Error(`Unparseable amount string: ${s}`);
    const [, num, unit] = m;
    return parseFloat(num) * (unit === "M" ? 1_000_000 : 1_000);
  };

  assert.ok(
    Math.abs(parseDisplayAmount(sbaFacility!.amount) - sbaTranche!.amount) <= 5_000,
    `SBA Term Loan: debtFacilities "${sbaFacility!.amount}" != capStack ${sbaTranche!.amount}`
  );
  assert.ok(
    Math.abs(parseDisplayAmount(sellerFacility!.amount) - sellerTranche!.amount) <= 5_000,
    `Seller Note: debtFacilities "${sellerFacility!.amount}" != capStack ${sellerTranche!.amount}`
  );
});

for (const [label, years] of [
  ["financialYearsPreInitiative", financialYearsPreInitiative],
  ["financialYearsPostInitiative", financialYearsPostInitiative],
] as const) {
  test(`${label}: ebitdaMargin matches ebitda / revenue`, () => {
    for (const y of years) {
      const expectedMargin = (y.ebitda / y.revenue) * 100;
      assert.ok(
        Math.abs(y.ebitdaMargin - expectedMargin) <= PCT_TOLERANCE,
        `${label} ${y.year}: ebitdaMargin ${y.ebitdaMargin} != expected ${expectedMargin.toFixed(1)}`
      );
    }
  });
}

test("ebitdaBridge cumulative total reconciles to post-initiative Yr5 EBITDA", () => {
  const total = ebitdaBridge.reduce((acc, item) => acc + item.value, 0);
  const yr5PostInitiative = financialYearsPostInitiative[financialYearsPostInitiative.length - 1];
  assert.ok(
    Math.abs(total - yr5PostInitiative.ebitda) <= DOLLAR_TOLERANCE,
    `ebitdaBridge sums to ${total}, expected Yr5 post-initiative EBITDA ${yr5PostInitiative.ebitda}`
  );
});

test("ebitdaBridge baseline + pre-initiative levers reconcile to pre-initiative Yr1 EBITDA", () => {
  // The bridge stacks: baseline -> (rent/Florence/SCF/COGS levers, pre-initiative)
  // -> (Phase 1/2/3 initiatives, post-initiative). The running total through the
  // last pre-initiative lever should land on financialYearsPreInitiative Yr1.
  const initiativeIndex = ebitdaBridge.findIndex((item) => item.name.startsWith("Phase"));
  assert.ok(initiativeIndex > 0, "ebitdaBridge has no Phase-prefixed initiative rows");

  const preInitiativeTotal = ebitdaBridge
    .slice(0, initiativeIndex)
    .reduce((acc, item) => acc + item.value, 0);
  const yr1PreInitiative = financialYearsPreInitiative[0];
  assert.ok(
    Math.abs(preInitiativeTotal - yr1PreInitiative.ebitda) <= 500,
    `ebitdaBridge pre-initiative levers sum to ${preInitiativeTotal}, expected pre-initiative Yr1 EBITDA ${yr1PreInitiative.ebitda}`
  );
});

function auditCashFlows(label: string, flows: typeof scenario1CashFlows) {
  test(`${label}: taxes, distributableFCF, and partner allocations reconcile`, () => {
    for (const f of flows) {
      const pretax = f.ebitda + f.lpInterest + f.sellerNote + f.capitalReserve;
      const expectedTax = -Math.round(pretax * 0.25);
      assert.ok(
        Math.abs(f.taxes - expectedTax) <= DOLLAR_TOLERANCE,
        `${label} ${f.year}: taxes ${f.taxes} != expected 25% tax ${expectedTax}`
      );

      const expectedFCF = pretax + f.taxes;
      assert.ok(
        Math.abs(f.distributableFCF - expectedFCF) <= DOLLAR_TOLERANCE,
        `${label} ${f.year}: distributableFCF ${f.distributableFCF} != pretax-tax ${expectedFCF}`
      );

      const allocated = f.managingMember + f.juniorPartner + (f.seniorLPEquity ?? 0);
      assert.ok(
        Math.abs(allocated - f.distributableFCF) <= DOLLAR_TOLERANCE,
        `${label} ${f.year}: partner allocations ${allocated} != distributableFCF ${f.distributableFCF}`
      );
    }
  });
}

auditCashFlows("scenario1CashFlows", scenario1CashFlows);
auditCashFlows("scenario2CashFlows", scenario2CashFlows);

function auditIncomeStatement(
  label: string,
  rows: typeof incomeStatementPreInitiative,
  checkAllocationSum: boolean
) {
  test(`${label}: taxes and distributableFCF reconcile${checkAllocationSum ? " (incl. GP+JP allocation)" : ""}`, () => {
    const find = (matcher: (l: string) => boolean) =>
      rows.find((r) => matcher(r.label))?.values ?? [];

    const ebitda = find((l) => l === "EBITDA");
    const lpInterest = find((l) => l.startsWith("LP Interest"));
    const sellerNote = find((l) => l.startsWith("Seller Note"));
    const capitalReserve = find((l) => l.startsWith("Capital Reserve"));
    const taxes = find((l) => l.startsWith("Est. Taxes"));
    const fcf = find((l) => l.startsWith("Distributable FCF"));
    const gp = find((l) => l.startsWith("→ GP"));
    const jp = find((l) => l.startsWith("→ JP"));

    incomeStatementYears.forEach((year, i) => {
      const e = Number(ebitda[i]);
      const li = Number(lpInterest[i]);
      const sn = Number(sellerNote[i]);
      const cr = Number(capitalReserve[i]);
      const tx = Number(taxes[i]);
      const distFcf = Number(fcf[i]);

      const pretax = e + li + sn + cr;
      const expectedTax = -Math.round(pretax * 0.25);
      assert.ok(
        Math.abs(tx - expectedTax) <= DOLLAR_TOLERANCE,
        `${label} ${year}: taxes ${tx} != expected 25% tax ${expectedTax}`
      );

      const expectedFCF = pretax + tx;
      assert.ok(
        Math.abs(distFcf - expectedFCF) <= DOLLAR_TOLERANCE,
        `${label} ${year}: distributableFCF ${distFcf} != pretax-tax ${expectedFCF}`
      );

      if (checkAllocationSum) {
        const allocated = Number(gp[i]) + Number(jp[i]);
        assert.ok(
          Math.abs(allocated - distFcf) <= DOLLAR_TOLERANCE,
          `${label} ${year}: GP+JP ${allocated} != distributableFCF ${distFcf}`
        );
      }
    });
  });
}

// incomeStatementPostInitiative's GP+JP rows are a documented, deferred
// AUDIT-FOLLOWUP (79/16 split only covers 95% of FCF, pending a product
// decision on the LP kicker) — see ROADMAP.md. Skip the allocation-sum
// check there, matching scripts/audit-financials.ts's existing behavior,
// so this test suite doesn't fail on a known, already-tracked issue.
auditIncomeStatement("incomeStatementPreInitiative", incomeStatementPreInitiative, true);
auditIncomeStatement("incomeStatementPostInitiative", incomeStatementPostInitiative, false);

test("sensitivityMoicMatrix base cell is internally addressable", () => {
  const row = sensitivityMoicMatrix[sensitivityBaseRow];
  assert.ok(row, `sensitivityBaseRow ${sensitivityBaseRow} is out of bounds`);
  const cell = row[sensitivityBaseCol];
  assert.ok(
    typeof cell === "number" && cell > 0,
    `sensitivityMoicMatrix[${sensitivityBaseRow}][${sensitivityBaseCol}] is not a positive number: ${cell}`
  );
});

test("sensitivityMoicMatrix is monotonically increasing across each row and column", () => {
  // Higher revenue (columns) and higher exit multiple (rows) should never
  // produce a lower MOIC — a non-monotonic cell is a strong signal of a
  // copy/paste error in the hand-entered matrix.
  for (let r = 0; r < sensitivityMoicMatrix.length; r++) {
    const row = sensitivityMoicMatrix[r];
    for (let c = 1; c < row.length; c++) {
      assert.ok(
        row[c] >= row[c - 1],
        `sensitivityMoicMatrix[${r}][${c}] (${row[c]}) < [${r}][${c - 1}] (${row[c - 1]})`
      );
    }
  }
  for (let c = 0; c < sensitivityMoicMatrix[0].length; c++) {
    for (let r = 1; r < sensitivityMoicMatrix.length; r++) {
      assert.ok(
        sensitivityMoicMatrix[r][c] >= sensitivityMoicMatrix[r - 1][c],
        `sensitivityMoicMatrix[${r}][${c}] (${sensitivityMoicMatrix[r][c]}) < [${r - 1}][${c}] (${sensitivityMoicMatrix[r - 1][c]})`
      );
    }
  }
});
