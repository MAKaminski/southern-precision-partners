"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { ebitdaBridge } from "@/lib/data";

// Build waterfall data
function buildWaterfallData() {
  let cumulative = 0;
  return ebitdaBridge.map((item) => {
    const start = cumulative;
    cumulative += item.value;
    return {
      name: item.name,
      start: item.isBase ? 0 : start,
      value: item.value,
      total: cumulative,
      isBase: item.isBase,
    };
  });
}

const waterfallData = buildWaterfallData();

function formatTick(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function EBITDABridgeChart() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={waterfallData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={{ stroke: "#E2E8F0" }} angle={-45} textAnchor="end" height={100} />
          <YAxis tickFormatter={formatTick} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            formatter={(value) => formatTick(Number(value))}
          />
          {/* Invisible base */}
          <Bar dataKey="start" stackId="a" fill="transparent" />
          {/* Visible portion */}
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={index} fill={entry.isBase ? "#2563EB" : "#059669"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
