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
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={{ stroke: "#1F2937" }} angle={-45} textAnchor="end" height={100} />
          <YAxis tickFormatter={formatTick} tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #1F2937", borderRadius: "8px", color: "#F9FAFB" }}
            formatter={(value) => formatTick(Number(value))}
          />
          {/* Invisible base */}
          <Bar dataKey="start" stackId="a" fill="transparent" />
          {/* Visible portion */}
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {waterfallData.map((entry, index) => (
              <Cell key={index} fill={entry.isBase ? "#3B82F6" : "#10B981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
