// Lightweight, dependency-free consistency check for the hardcoded deal
// figures in src/lib/data.ts. Run with:
//   node --experimental-strip-types scripts/verify-financials.ts
// Catches the class of bug where a dollar figure is updated in one place
// (e.g. capStack) but not in the others that quote the same number
// (debtFacilities, keyRisks prose, etc).

import {
  capStack,
  totalRaise,
  usesOfFunds,
  debtFacilities,
  keyRisks,
} from "../src/lib/data.ts";

function parseMoney(s: string): number {
  const match = s.match(/\$([\d.]+)\s*([MK])/i);
  if (!match) throw new Error(`Could not parse money string: "${s}"`);
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return unit === "M" ? value * 1_000_000 : value * 1_000;
}

// Amounts under ~$5K are lost when rounding to the nearest $K/M in prose
// figures (e.g. "$200K" for $201,500), so comparisons use this tolerance.
const TOLERANCE = 5_000;

let failures = 0;
function check(label: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > TOLERANCE) {
    failures++;
    console.error(
      `FAIL: ${label} — expected ~${expected.toLocaleString()}, got ${actual.toLocaleString()}`
    );
  } else {
    console.log(`OK:   ${label}`);
  }
}

// 1. Cap stack tranches sum to the total raise.
const capStackSum = capStack.reduce((sum, t) => sum + t.amount, 0);
check("capStack sums to totalRaise", capStackSum, totalRaise);

// 2. Uses of funds sum to the total raise.
const usesSum = usesOfFunds.reduce((sum, u) => sum + u.amount, 0);
check("usesOfFunds sums to totalRaise", usesSum, totalRaise);

// 3. Debt facility amounts reconcile with the cap stack for the same
//    instrument (LP Debt, Seller Note).
const capStackByPrefix = (prefix: string) =>
  capStack.find((t) => t.name.startsWith(prefix))?.amount ?? 0;

for (const facility of debtFacilities) {
  const prefix = facility.name.split(" ")[0] === "LP" ? "LP Debt" : facility.name;
  const capAmount = capStackByPrefix(prefix);
  if (capAmount === 0) continue; // no matching cap stack tranche (e.g. SCF/AR facilities)
  check(
    `debtFacilities["${facility.name}"] matches capStack`,
    parseMoney(facility.amount),
    capAmount
  );
}

// 4. keyRisks prose that quotes a total-debt figure should match
//    LP Debt + Seller Note from the cap stack.
const lpDebt = capStackByPrefix("LP Debt");
const sellerNote = capStackByPrefix("Seller Note");
const expectedTotalDebt = lpDebt + sellerNote;
for (const risk of keyRisks) {
  const match = risk.match(/\$([\d.]+)M total debt/);
  if (match) {
    check("keyRisks total debt figure", parseFloat(match[1]) * 1_000_000, expectedTotalDebt);
  }
}

if (failures > 0) {
  console.error(`\n${failures} consistency check(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll financial consistency checks passed.");
}
