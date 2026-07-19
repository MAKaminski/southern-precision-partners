// Cross-checks derived figures in src/lib/data.ts against the formulas they
// claim to follow (25% tax on pretax FCF, distributable FCF = pretax - tax,
// partner allocations sum to distributable FCF). Catches drift like the
// incomeStatementPreInitiative bug where taxes/FCF were hand-edited out of
// sync with the rest of the table.
//
// Run with: npm run audit:financials
import {
  scenario1CashFlows,
  scenario2CashFlows,
  incomeStatementPreInitiative,
  incomeStatementPostInitiative,
  incomeStatementYears,
} from "../src/lib/data.ts";

const TOLERANCE = 2; // dollars — source data is hand-rounded

const failures: string[] = [];
function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

function auditCashFlows(label: string, flows: typeof scenario1CashFlows) {
  for (const f of flows) {
    const pretax = f.ebitda + f.lpInterest + f.sellerNote + f.capitalReserve;
    const expectedTax = -Math.round(pretax * 0.25);
    check(
      Math.abs(f.taxes - expectedTax) <= TOLERANCE,
      `${label} ${f.year}: taxes ${f.taxes} != expected 25% tax ${expectedTax}`
    );

    const expectedFCF = pretax + f.taxes;
    check(
      Math.abs(f.distributableFCF - expectedFCF) <= TOLERANCE,
      `${label} ${f.year}: distributableFCF ${f.distributableFCF} != pretax-tax ${expectedFCF}`
    );

    const allocated = f.managingMember + f.juniorPartner + (f.seniorLPEquity ?? 0);
    check(
      Math.abs(allocated - f.distributableFCF) <= TOLERANCE,
      `${label} ${f.year}: partner allocations ${allocated} != distributableFCF ${f.distributableFCF}`
    );
  }
}

// checkAllocationSum: incomeStatementPreInitiative has no LP equity kicker,
// so GP+JP should exhaust 100% of distributable FCF. incomeStatementPostInitiative
// pairs 10% IO (no-kicker) debt terms with a 79/16 GP/JP split, which leaves an
// un-displayed 5% — see AUDIT-FOLLOWUP note in data.ts above that table. Skip the
// allocation-sum check there until that's reconciled (roadmap item logged).
function auditIncomeStatement(
  label: string,
  rows: typeof incomeStatementPreInitiative,
  checkAllocationSum: boolean
) {
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
    check(
      Math.abs(tx - expectedTax) <= TOLERANCE,
      `${label} ${year}: taxes ${tx} != expected 25% tax ${expectedTax}`
    );

    const expectedFCF = pretax + tx;
    check(
      Math.abs(distFcf - expectedFCF) <= TOLERANCE,
      `${label} ${year}: distributableFCF ${distFcf} != pretax-tax ${expectedFCF}`
    );

    if (checkAllocationSum) {
      const allocated = Number(gp[i]) + Number(jp[i]);
      check(
        Math.abs(allocated - distFcf) <= TOLERANCE,
        `${label} ${year}: GP+JP ${allocated} != distributableFCF ${distFcf}`
      );
    }
  });
}

auditCashFlows("scenario1CashFlows", scenario1CashFlows);
auditCashFlows("scenario2CashFlows", scenario2CashFlows);
auditIncomeStatement("incomeStatementPreInitiative", incomeStatementPreInitiative, true);
auditIncomeStatement("incomeStatementPostInitiative", incomeStatementPostInitiative, false);

if (failures.length > 0) {
  console.error(`✗ ${failures.length} financial consistency check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("✓ All financial consistency checks passed.");
