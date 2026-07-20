// Regression guard for the hardcoded return figures in src/lib/data.ts.
// Recomputes MOIC (proceeds / invested) from the same source-of-truth
// numbers the site displays and flags any figure that has drifted, since
// this repo's history shows these numbers get hand-edited and have gone
// out of sync before (e.g. "fix: GP always 15%+ higher MOIC/IRR than JP").
//
// Run: npm run audit:financials

import {
  capStack,
  investorReturns,
  fullScenarios,
  usesOfFunds,
  totalRaise,
} from "../src/lib/data.ts";

const MOIC_TOLERANCE = 0.015; // 1.5% relative drift allowed for display rounding

let failures = 0;
let checks = 0;

function parseMoney(raw: string): number {
  const cleaned = raw.replace(/[^0-9.MK]/g, "");
  const mult = cleaned.endsWith("M") ? 1_000_000 : cleaned.endsWith("K") ? 1_000 : 1;
  const num = parseFloat(cleaned.replace(/[MK]$/, ""));
  if (Number.isNaN(num)) throw new Error(`Could not parse money value: "${raw}"`);
  return num * mult;
}

function parseMultiple(raw: string): number {
  const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) throw new Error(`Could not parse multiple value: "${raw}"`);
  return num;
}

function checkMoic(label: string, investedRaw: number, proceedsRaw: string, statedMoicRaw: string) {
  checks++;
  const proceeds = parseMoney(proceedsRaw);
  const statedMoic = parseMultiple(statedMoicRaw);
  const impliedMoic = proceeds / investedRaw;
  const drift = Math.abs(impliedMoic - statedMoic) / impliedMoic;
  if (drift > MOIC_TOLERANCE) {
    failures++;
    console.error(
      `FAIL  ${label}: stated MOIC ${statedMoic}× vs implied ${impliedMoic.toFixed(3)}× ` +
        `(proceeds ${proceedsRaw} / invested $${investedRaw.toLocaleString()}), drift ${(drift * 100).toFixed(1)}%`
    );
  } else {
    console.log(`pass  ${label}: ${statedMoic}× stated, ${impliedMoic.toFixed(3)}× implied`);
  }
}

console.log("── Investor return cards (src/lib/data.ts: investorReturns) ──");
for (const r of investorReturns) {
  checkMoic(r.title, parseMoney(r.invested), r.proceeds, r.moic);
}

console.log("\n── Full scenario table (src/lib/data.ts: fullScenarios) ──");
const lpInvested = parseMoney(capStack[0].amount.toString());
const mpInvested = capStack[1].amount;
const jpInvested = capStack[2].amount;
for (const s of fullScenarios) {
  checkMoic(`${s.name} — LP`, lpInvested, s.lp.proceeds, s.lp.moic);
  checkMoic(`${s.name} — MP`, mpInvested, s.mp.proceeds, s.mp.moic);
  checkMoic(`${s.name} — JP`, jpInvested, s.jp.proceeds, s.jp.moic);
}

console.log("\n── Cap stack / uses of funds totals ──");
checks++;
const capStackTotal = capStack.reduce((sum, t) => sum + t.amount, 0);
if (capStackTotal !== totalRaise) {
  failures++;
  console.error(`FAIL  capStack amounts sum to $${capStackTotal.toLocaleString()}, expected totalRaise $${totalRaise.toLocaleString()}`);
} else {
  console.log(`pass  capStack sums to totalRaise ($${totalRaise.toLocaleString()})`);
}

checks++;
const capStackPct = capStack.reduce((sum, t) => sum + t.pct, 0);
if (Math.abs(capStackPct - 100) > 0.1) {
  failures++;
  console.error(`FAIL  capStack pct sums to ${capStackPct}%, expected 100%`);
} else {
  console.log(`pass  capStack pct sums to ${capStackPct.toFixed(1)}%`);
}

checks++;
const usesTotal = usesOfFunds.reduce((sum, u) => sum + u.amount, 0);
if (usesTotal !== totalRaise) {
  failures++;
  console.error(`FAIL  usesOfFunds sum to $${usesTotal.toLocaleString()}, expected totalRaise $${totalRaise.toLocaleString()}`);
} else {
  console.log(`pass  usesOfFunds sums to totalRaise ($${totalRaise.toLocaleString()})`);
}

console.log(`\n${checks - failures}/${checks} checks passed.`);
if (failures > 0) {
  console.error(`\n${failures} financial figure(s) have drifted beyond ${MOIC_TOLERANCE * 100}% tolerance — check src/lib/data.ts.`);
  process.exit(1);
}
