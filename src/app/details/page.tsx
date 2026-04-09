"use client";

import { useState } from "react";
import { RevenueEBITDAChart } from "@/components/RevenueEBITDAChart";
import { IncomeStatementTable } from "@/components/IncomeStatementTable";
import { CapStackBar } from "@/components/CapStackBar";
import { DebtFacilityGrid } from "@/components/DebtFacilityGrid";
import { FloatMechanicsDiagram } from "@/components/FloatMechanicsDiagram";
import { InitiativeCard } from "@/components/InitiativeCard";
import { EBITDABridgeChart } from "@/components/EBITDABridgeChart";
import { SensitivityHeatmap } from "@/components/SensitivityHeatmap";
import { FullScenarioCards } from "@/components/FullScenarioCards";
import { LenderComparisonTable } from "@/components/LenderComparisonTable";
import {
  phases,
  usesOfFunds,
  sensitivityRevenueLabels,
  sensitivityExitMultiples,
  sensitivityMoicMatrix,
  sensitivityBaseRow,
  sensitivityBaseCol,
  irrHoldPeriods,
  irrExitMultiples,
  irrMatrix,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const tabs = ["Financials", "Deal Structure", "Initiatives", "Returns", "Lenders"] as const;
type Tab = (typeof tabs)[number];

export default function DetailsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Financials");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Project Mosaic — Deep Dive</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-custom mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "text-accent-blue border-b-2 border-accent-blue"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Financials" && <FinancialsTab />}
      {activeTab === "Deal Structure" && <DealStructureTab />}
      {activeTab === "Initiatives" && <InitiativesTab />}
      {activeTab === "Returns" && <ReturnsTab />}
      {activeTab === "Lenders" && <LendersTab />}
    </div>
  );
}

function FinancialsTab() {
  return (
    <div className="space-y-8" id="financials">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Revenue & EBITDA</h2>
        <div className="bg-surface border border-border-custom rounded-lg p-4">
          <RevenueEBITDAChart />
        </div>
      </div>
      <div className="bg-surface border border-border-custom rounded-lg p-4">
        <IncomeStatementTable />
      </div>
    </div>
  );
}

function DealStructureTab() {
  return (
    <div className="space-y-8" id="deal-structure">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Sources & Uses</h2>
        <div className="bg-surface border border-border-custom rounded-lg p-5">
          <CapStackBar />
          <div className="mt-4 border-t border-border-custom pt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Uses of Funds</h4>
            <div className="flex flex-wrap gap-3">
              {usesOfFunds.map((u) => (
                <span key={u.label} className="text-xs text-text-secondary">
                  {u.label}: <span className="text-foreground font-medium">{formatCurrency(u.amount, true)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-custom rounded-lg p-5">
        <DebtFacilityGrid />
      </div>
      <div className="bg-surface border border-border-custom rounded-lg p-5">
        <FloatMechanicsDiagram />
      </div>
    </div>
  );
}

function InitiativesTab() {
  const allInitiatives = phases.flatMap((p) => p.initiatives);
  return (
    <div className="space-y-8" id="initiatives">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Value Creation Initiatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allInitiatives.map((init) => (
            <InitiativeCard key={init.name} initiative={init} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">EBITDA Bridge — Waterfall</h2>
        <div className="bg-surface border border-border-custom rounded-lg p-4">
          <EBITDABridgeChart />
          <p className="text-xs text-text-secondary mt-2">
            Base EBITDA: $554K → Year 5 target (all initiatives on): $1.3M+. Base case (organic only): $877K.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReturnsTab() {
  return (
    <div className="space-y-8" id="returns">
      <div className="bg-surface border border-border-custom rounded-lg p-5">
        <SensitivityHeatmap
          title="LP MOIC Sensitivity — Exit Multiple × Revenue Growth"
          rowLabels={sensitivityExitMultiples}
          colLabels={sensitivityRevenueLabels}
          data={sensitivityMoicMatrix}
          baseRow={sensitivityBaseRow}
          baseCol={sensitivityBaseCol}
        />
      </div>
      <div className="bg-surface border border-border-custom rounded-lg p-5">
        <SensitivityHeatmap
          title="LP IRR Sensitivity — Exit Multiple × Hold Period"
          rowLabels={irrExitMultiples}
          colLabels={irrHoldPeriods}
          data={irrMatrix}
          baseRow={2}
          baseCol={2}
          suffix="%"
        />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Full Investor Returns by Scenario</h2>
        <FullScenarioCards />
      </div>
    </div>
  );
}

function LendersTab() {
  return (
    <div id="lenders">
      <h2 className="text-lg font-semibold text-foreground mb-4">Lender Comparison</h2>
      <div className="bg-surface border border-border-custom rounded-lg p-5">
        <LenderComparisonTable />
      </div>
    </div>
  );
}
