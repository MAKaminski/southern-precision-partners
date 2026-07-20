"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { financialYears, cashFlowProjections } from "@/lib/data";

// Outstanding debt: SBA Term Loan $2.24M declining $224K/yr (per Financing
// Schedule) + Seller Note $280K held flat (amortization term not yet
// finalized — see debtFacilities).
const outstandingDebt = [2_296_000, 2_072_000, 1_848_000, 1_624_000, 1_400_000];

const chartData = financialYears.map((y, i) => ({
  year: y.label,
  EBITDA: y.ebitda,
  "Free Cash Flow": cashFlowProjections[i].freeCashFlow,
  "Outstanding Debt": outstandingDebt[i],
}));

type BarKey = "EBITDA" | "Free Cash Flow" | "Outstanding Debt";

const barConfig: { key: BarKey; fill: string; label: string }[] = [
  { key: "EBITDA", fill: "#2563EB", label: "EBITDA" },
  { key: "Free Cash Flow", fill: "#059669", label: "Free Cash Flow" },
  { key: "Outstanding Debt", fill: "#F87171", label: "Outstanding Debt" },
];

function formatTick(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function RevenueEBITDAChart() {
  const [visible, setVisible] = useState<Record<BarKey, boolean>>({
    EBITDA: true,
    "Free Cash Flow": true,
    "Outstanding Debt": true,
  });

  function toggle(key: BarKey) {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {barConfig.map(({ key, fill, label }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
              visible[key]
                ? "border-transparent text-foreground shadow-sm"
                : "border-border-custom text-text-secondary opacity-50"
            }`}
            style={visible[key] ? { backgroundColor: fill + "20", borderColor: fill + "40" } : {}}
          >
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: visible[key] ? fill : "#D1D5DB" }}
            />
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={1} barCategoryGap="12%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
            <YAxis tickFormatter={formatTick} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                color: "#1E293B",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                fontSize: 12,
              }}
              formatter={(value) => formatTick(Number(value))}
            />
            <Legend wrapperStyle={{ color: "#64748B", fontSize: 10 }} />
            {barConfig.map(({ key, fill }) =>
              visible[key] ? (
                <Bar key={key} dataKey={key} fill={fill} radius={[3, 3, 0, 0]} />
              ) : null
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
