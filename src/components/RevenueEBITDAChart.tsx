"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { financialYearsPreInitiative, financialYearsPostInitiative } from "@/lib/data";

const chartData = financialYearsPreInitiative.map((pre, i) => {
  const post = financialYearsPostInitiative[i];
  return {
    year: pre.label,
    "Revenue (Organic)": pre.revenue,
    "Revenue (w/ Initiatives)": post.revenue,
    "EBITDA (Organic)": pre.ebitda,
    "EBITDA (w/ Initiatives)": post.ebitda,
  };
});

function formatTick(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function RevenueEBITDAChart() {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={2} barCategoryGap="15%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
          <YAxis tickFormatter={formatTick} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            formatter={(value) => formatTick(Number(value))}
          />
          <Legend wrapperStyle={{ color: "#64748B", fontSize: 11 }} />
          <Bar dataKey="EBITDA (Organic)" fill="#93C5FD" radius={[4, 4, 0, 0]} />
          <Bar dataKey="EBITDA (w/ Initiatives)" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
