// Cross-checks derived figures in src/lib/data.ts against the formulas they
// claim to follow: EBITDA margin = ebitda/revenue, distributable pool = min(1/3
// Net Income, Free Cash Flow), JP distribution = pool x vested JP %, GP gets
// the remainder, and cap-stack/uses-of-funds totals reconcile to totalRaise.
//
// Run with: npm run audit:financials
import {
  financialYears,
  cashFlowProjections,
  capStack,
  totalRaise,
  usesOfFunds,
} from "../src/lib/data.ts";

const TOLERANCE = 2; // dollars — source data is hand-rounded

const failures: string[] = [];
function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

financialYears.forEach((y) => {
  const impliedMargin = (y.ebitda / y.revenue) * 100;
  check(
    Math.abs(y.ebitdaMargin - impliedMargin) <= 0.15,
    `financialYears ${y.label}: ebitdaMargin ${y.ebitdaMargin}% != ebitda/revenue ${impliedMargin.toFixed(2)}%`
  );
});

cashFlowProjections.forEach((f) => {
  const pretax = f.ebitda + f.sbaInterest + f.sellerNoteInterest;
  const expectedNetIncome = pretax + f.taxes;
  check(
    Math.abs(f.netIncome - expectedNetIncome) <= TOLERANCE,
    `cashFlowProjections ${f.year}: netIncome ${f.netIncome} != EBITDA-interest-taxes ${expectedNetIncome}`
  );

  const expectedFCF = f.netIncome + f.capex;
  check(
    Math.abs(f.freeCashFlow - expectedFCF) <= TOLERANCE,
    `cashFlowProjections ${f.year}: freeCashFlow ${f.freeCashFlow} != netIncome+capex ${expectedFCF}`
  );

  const expectedPool = Math.min(Math.round(f.netIncome / 3), f.freeCashFlow);
  check(
    Math.abs(f.distributablePool - expectedPool) <= TOLERANCE,
    `cashFlowProjections ${f.year}: distributablePool ${f.distributablePool} != min(1/3 NI, FCF) ${expectedPool}`
  );

  const expectedJP = Math.round(f.distributablePool * (f.jpEquityPct / 100));
  check(
    Math.abs(f.jpDistribution - expectedJP) <= TOLERANCE,
    `cashFlowProjections ${f.year}: jpDistribution ${f.jpDistribution} != pool x ${f.jpEquityPct}% = ${expectedJP}`
  );

  const expectedGP = f.distributablePool - f.jpDistribution;
  check(
    Math.abs(f.gpDistribution - expectedGP) <= TOLERANCE,
    `cashFlowProjections ${f.year}: gpDistribution ${f.gpDistribution} != pool-jpDistribution ${expectedGP}`
  );
});

{
  const sumAmounts = capStack.reduce((s, t) => s + t.amount, 0);
  check(
    Math.abs(sumAmounts - totalRaise) <= TOLERANCE,
    `capStack: tranche amounts sum to ${sumAmounts}, not totalRaise ${totalRaise}`
  );
  const sumPct = capStack.reduce((s, t) => s + t.pct, 0);
  check(Math.abs(sumPct - 100) <= 0.2, `capStack: tranche percentages sum to ${sumPct}%, not 100%`);

  const sumUses = usesOfFunds.reduce((s, u) => s + u.amount, 0);
  check(
    Math.abs(sumUses - totalRaise) <= TOLERANCE,
    `usesOfFunds: line items sum to ${sumUses}, not totalRaise ${totalRaise}`
  );
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} financial consistency check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("✓ All financial consistency checks passed.");
