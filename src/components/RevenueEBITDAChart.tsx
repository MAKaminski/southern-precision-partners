"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { financialYearsPreInitiative, financialYearsPostInitiative, scenario1CashFlows } from "@/lib/data";

// FCF from scenario 1 (organic) and approximate post-initiative FCF
const organicFCF = scenario1CashFlows.map((cf) => cf.distributableFCF);
// Post-initiative FCF (from incomeStatementPostInitiative data)
const postInitFCF = [256_275, 377_963, 375_796, 456_023, 453_636];

// Outstanding debt: LP $2.4M bullet (stays flat), Seller note $200K amortizing
// Seller note: 5-yr amort on $200K at 6% → principal balance declines ~$40K/yr
const outstandingDebt = [2_600_000, 2_560_000, 2_520_000, 2_480_000, 2_440_000];

const chartData = financialYearsPreInitiative.map((pre, i) => {
  const post = financialYearsPostInitiative[i];
  return {
    year: pre.label,
    "EBITDA (Organic)": pre.ebitda,
    "EBITDA (w/ Initiatives)": post.ebitda,
    "FCF (Organic)": organicFCF[i],
    "FCF (w/ Initiatives)": postInitFCF[i],
    "Outstanding Debt": outstandingDebt[i],
  };
});

type BarKey = "EBITDA (Organic)" | "EBITDA (w/ Initiatives)" | "FCF (Organic)" | "FCF (w/ Initiatives)" | "Outstanding Debt";

const barConfig: { key: BarKey; fill: string; label: string }[] = [
  { key: "EBITDA (Organic)", fill: "#93C5FD", label: "EBITDA (Organic)" },
  { key: "EBITDA (w/ Initiatives)", fill: "#2563EB", label: "EBITDA (w/ Init.)" },
  { key: "FCF (Organic)", fill: "#6EE7B7", label: "FCF (Organic)" },
  { key: "FCF (w/ Initiatives)", fill: "#059669", label: "FCF (w/ Init.)" },
  { key: "Outstanding Debt", fill: "#F87171", label: "Outstanding Debt" },
];

function formatTick(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function RevenueEBITDAChart() {
  const [visible, setVisible] = useState<Record<BarKey, boolean>>({
    "EBITDA (Organic)": true,
    "EBITDA (w/ Initiatives)": true,
    "FCF (Organic)": true,
    "FCF (w/ Initiatives)": true,
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
