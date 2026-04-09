"use client";

import { useState } from "react";
import {
  incomeStatementPreInitiative,
  incomeStatementPostInitiative,
  incomeStatementYears,
  scenario1CashFlows,
  scenario2CashFlows,
  ebitdaBridgeNormalization,
} from "@/lib/data";

function fmt(val: number | null): string {
  if (val === null) return "—";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  if (abs < 100) return `${val.toFixed(1)}%`;
  return `${sign}$${abs}`;
}

export function IncomeStatementTable() {
  const [view, setView] = useState<"comparison" | "scenario1" | "scenario2">("comparison");

  return (
    <div>
      {/* EBITDA Bridge Summary */}
      <div className="mb-6 bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-accent-blue uppercase mb-2">EBITDA Normalization Bridge</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="text-text-secondary">Baseline (CIM): <b className="text-foreground">${(ebitdaBridgeNormalization.baselineEbitda / 1000).toFixed(0)}K</b></span>
          <span className="text-text-secondary">→ + Rent Reclamation <b className="text-accent-green">+$90K</b></span>
          <span className="text-text-secondary">→ + Florence Optimization <b className="text-accent-green">+$28K</b></span>
          <span className="text-text-secondary">= Normalized Day 1: <b className="text-foreground">${(ebitdaBridgeNormalization.normalizedDay1 / 1000).toFixed(0)}K</b></span>
          <span className="text-text-secondary">→ + SCF Float <b className="text-accent-green">+$56.8K</b></span>
          <span className="text-text-secondary">→ + COGS Reduction <b className="text-accent-green">+$45.2K</b></span>
          <span className="text-text-secondary">= Year 1 Pro-Forma: <b className="text-foreground">${(ebitdaBridgeNormalization.year1ProForma / 1000).toFixed(0)}K</b></span>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-foreground">Cash Flow Projections</h3>
        <div className="flex gap-1 ml-auto">
          {(["comparison", "scenario1", "scenario2"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                view === v ? "bg-accent-blue text-white" : "text-text-secondary hover:bg-surface"
              }`}
            >
              {v === "comparison" ? "Pre vs Post Initiative" : v === "scenario1" ? "Scenario 1 (10% IO)" : "Scenario 2 (7% + Kicker)"}
            </button>
          ))}
        </div>
      </div>

      {view === "comparison" && <ComparisonView />}
      {view === "scenario1" && <ScenarioView flows={scenario1CashFlows} label="Scenario 1 — 10% LP IO" />}
      {view === "scenario2" && <ScenarioView flows={scenario2CashFlows} label="Scenario 2 — 7% + 5% Equity Kicker" hasEquityKicker />}

      <p className="text-[10px] text-text-secondary mt-2">
        Baseline EBITDA: $334K (CIM) → Normalized: $452K → Year 1 Pro-Forma: $554K.
        Revenue growth: 5% organic. EBITDA scales from 11.5% to 15.0% over 5 years.
        Post-LBO D&A: $61,364/yr (includes $36,364 real estate depreciation at 27.5-yr SL).
      </p>
    </div>
  );
}

function ComparisonView() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border-custom">
            <th className="text-left py-2 px-2 text-text-secondary font-medium" />
            {incomeStatementYears.map((y) => (
              <th key={y} colSpan={2} className="text-center py-2 px-2 text-text-secondary font-medium border-l border-border-custom/50">{y}</th>
            ))}
          </tr>
          <tr className="border-b border-border-custom">
            <th className="text-left py-1 px-2 text-text-secondary font-medium text-[10px]">Metric</th>
            {incomeStatementYears.map((y) => (
              <Fragment key={y}>
                <th className="text-right py-1 px-1 text-[10px] text-accent-blue/70 font-medium border-l border-border-custom/50">Organic</th>
                <th className="text-right py-1 px-1 text-[10px] text-accent-green/70 font-medium">w/ Init.</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {incomeStatementPreInitiative.map((row, ri) => {
            const postRow = incomeStatementPostInitiative[ri];
            const isDistribution = row.label.startsWith("→");
            const isDistHeader = ri === 8; // first distribution row — add a section divider above
            return (
              <Fragment key={row.label}>
                {isDistHeader && (
                  <tr>
                    <td colSpan={11} className="py-1.5 px-2 text-[10px] text-text-secondary font-semibold uppercase bg-accent-blue/5 border-y border-border-custom">
                      Annual Cash to Investors (from FCF)
                    </td>
                  </tr>
                )}
                <tr className={`border-b border-border-custom/50 ${row.isHeader ? "bg-surface" : ""} ${isDistribution ? "bg-accent-green/5" : ""}`}>
                  <td className={`py-1.5 px-2 ${row.isHeader ? "font-semibold text-foreground" : isDistribution ? "text-accent-green font-medium pl-4" : "text-text-secondary"}`}>
                    {row.label}
                  </td>
                  {row.values.map((val, ci) => {
                    const postVal = postRow?.values[ci] ?? null;
                    return (
                      <Fragment key={ci}>
                        <td className={`py-1.5 px-1 text-right font-mono border-l border-border-custom/50 ${row.isHeader ? "font-semibold" : ""} ${isDistribution ? "text-accent-green/70" : "text-text-secondary"}`}>
                          {fmt(val)}
                        </td>
                        <td className={`py-1.5 px-1 text-right font-mono ${row.isHeader ? "font-semibold text-foreground" : isDistribution ? "text-accent-green font-medium" : "text-foreground"}`}>
                          {postVal !== null && postVal !== undefined ? fmt(postVal) : "—"}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Fragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ScenarioView({ flows, label, hasEquityKicker }: { flows: typeof scenario1CashFlows; label: string; hasEquityKicker?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-accent-blue font-medium mb-2">{label}</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border-custom">
            <th className="text-left py-2 px-2 text-text-secondary font-medium">Line Item</th>
            {flows.map((f) => (
              <th key={f.year} className="text-right py-2 px-2 text-text-secondary font-medium">{f.year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row label="Sales" values={flows.map((f) => f.sales)} isHeader />
          <Row label="EBITDA" values={flows.map((f) => f.ebitda)} isHeader />
          <Row label="EBITDA %" values={flows.map((f) => f.ebitdaPct)} isPct />
          <Row label={`LP Interest (${hasEquityKicker ? "7%" : "10%"} IO)`} values={flows.map((f) => f.lpInterest)} />
          <Row label="Seller Note (P&I)" values={flows.map((f) => f.sellerNote)} />
          <Row label="Capital Reserve" values={flows.map((f) => f.capitalReserve)} />
          <Row label="Est. Taxes (25%)" values={flows.map((f) => f.taxes)} />
          <Row label="Distributable FCF" values={flows.map((f) => f.distributableFCF)} isHeader highlight />
          <tr><td colSpan={6} className="py-2 px-2 text-[10px] text-text-secondary font-semibold uppercase">Partner Payouts</td></tr>
          <Row label="Managing Member" values={flows.map((f) => f.managingMember)} />
          <Row label="Junior Partner" values={flows.map((f) => f.juniorPartner)} />
          {hasEquityKicker && <Row label="Senior LP (5% equity)" values={flows.map((f) => f.seniorLPEquity ?? 0)} />}
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, values, isHeader, isPct, highlight }: { label: string; values: number[]; isHeader?: boolean; isPct?: boolean; highlight?: boolean }) {
  return (
    <tr className={`border-b border-border-custom/50 ${isHeader ? "bg-surface" : ""}`}>
      <td className={`py-1.5 px-2 ${isHeader ? "font-semibold text-foreground" : "text-text-secondary"}`}>{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-1.5 px-2 text-right font-mono ${
            isHeader ? "font-semibold text-foreground" : "text-text-secondary"
          } ${v < 0 ? "text-red-600/80" : ""} ${highlight ? "text-accent-green font-semibold" : ""}`}
        >
          {isPct ? `${v.toFixed(1)}%` : fmt(v)}
        </td>
      ))}
    </tr>
  );
}
