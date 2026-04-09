"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { financialYears } from "@/lib/data";

const chartData = financialYears.map((fy) => ({
  year: fy.label,
  Revenue: fy.revenue,
  EBITDA: fy.ebitda,
}));

function formatTick(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function RevenueEBITDAChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
          <YAxis tickFormatter={formatTick} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            formatter={(value) => formatTick(Number(value))}
          />
          <Legend wrapperStyle={{ color: "#64748B", fontSize: 12 }} />
          <Bar dataKey="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
          <Bar dataKey="EBITDA" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
