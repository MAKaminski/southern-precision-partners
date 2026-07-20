"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell,
} from "recharts";
import type { ArAgingByCustomer, Customer } from "@/lib/spp-queries";
import { isExcludedAggregate } from "@/lib/customer-segmentation";

const money = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v).toLocaleString()}`;

interface Point {
  id: string;
  name: string;
  invoiceCount: number;
  totalInvoiced: number;
  avgDaysToPay: number | null;
}

function speedColor(days: number | null): string {
  if (days === null) return "#94A3B8"; // gray — no payment-date signal
  if (days <= 0) return "#2563EB"; // blue — paid at/before invoice date
  if (days <= 30) return "#059669"; // green — fast
  if (days <= 60) return "#D97706"; // amber — slow
  return "#DC2626"; // red — slowest, the collections issue area
}

export function ArAgingQuadrant({ customers, aging }: { customers: Customer[]; aging: ArAgingByCustomer[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const points = useMemo<Point[]>(() => {
    const byId = new Map(customers.map((c) => [c.id, c]));
    return aging
      .map((a) => {
        const c = byId.get(a.customer_id);
        if (!c || isExcludedAggregate(c)) return null;
        if (a.invoice_count <= 0) return null;
        return {
          id: a.customer_id,
          name: c.name,
          invoiceCount: a.invoice_count,
          totalInvoiced: Number(a.total_invoice_amount) || 0,
          avgDaysToPay: a.avg_days_to_pay === null ? null : Number(a.avg_days_to_pay),
        };
      })
      .filter((p): p is Point => p !== null);
  }, [customers, aging]);

  const { medianX, medianY } = useMemo(() => {
    const xs = [...points.map((p) => p.invoiceCount)].sort((a, b) => a - b);
    const ys = [...points.map((p) => p.totalInvoiced)].sort((a, b) => a - b);
    const mid = (arr: number[]) => (arr.length === 0 ? 0 : arr[Math.floor(arr.length / 2)]);
    return { medianX: mid(xs), medianY: mid(ys) };
  }, [points]);

  if (points.length === 0) {
    return <p className="text-xs text-text-secondary">No AR aging data available.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap mb-2 text-[10px] text-text-secondary">
        <LegendDot color="#DC2626" label="60+ days to pay — biggest issue area" />
        <LegendDot color="#D97706" label="30–60 days" />
        <LegendDot color="#059669" label="0–30 days" />
        <LegendDot color="#2563EB" label="Paid at/before invoice date" />
        <LegendDot color="#94A3B8" label="No payment-date signal" />
      </div>
      <p className="text-[11px] text-text-secondary mb-2">
        Each point is a customer: x = lifetime invoice count, y = lifetime invoiced dollars, color = average days
        from invoice date to last payment on that invoice. Dashed lines mark the median, splitting the book into
        four quadrants — high-$/high-days in the upper area is where collections effort matters most. Some
        customers show a negative or near-zero average (payment dated at or before the invoice date) — that
        reflects how dates were recorded in the source ledger, not a data error; treat it as &quot;paid promptly,&quot;
        not literally negative time. Point-of-sale cash-transaction buckets are excluded. Click a point to open
        that customer.
      </p>
      <div className="h-[420px] w-full border border-border-custom rounded-lg bg-surface p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              type="number" dataKey="invoiceCount" name="Invoices"
              tick={{ fill: "#64748B", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }}
              label={{ value: "Lifetime invoice count", position: "insideBottom", offset: -5, fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              type="number" dataKey="totalInvoiced" name="Invoiced $"
              tickFormatter={(v) => money(Number(v))}
              tick={{ fill: "#64748B", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }}
              label={{ value: "Lifetime invoiced $", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }}
            />
            <ZAxis type="number" dataKey="invoiceCount" range={[40, 400]} />
            <ReferenceLine x={medianX} stroke="#94A3B8" strokeDasharray="4 4" />
            <ReferenceLine y={medianY} stroke="#94A3B8" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, color: "#1E293B" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Point;
                return (
                  <div className="bg-white border border-border-custom rounded-lg p-2 text-xs shadow">
                    <div className="font-semibold text-foreground">{p.name}</div>
                    <div className="text-text-secondary">{p.invoiceCount} invoices · {money(p.totalInvoiced)}</div>
                    <div className="text-text-secondary">
                      {p.avgDaysToPay === null ? "No payment-date signal" : `Avg ${p.avgDaysToPay.toFixed(0)} days to pay`}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              data={points}
              onClick={(d) => { const id = (d as unknown as Point).id; if (id) window.location.href = `/customers/${id}`; }}
              onMouseEnter={(d) => setHoveredId((d as unknown as Point).id)}
              onMouseLeave={() => setHoveredId(null)}
              cursor="pointer"
            >
              {points.map((p) => (
                <Cell key={p.id} fill={speedColor(p.avgDaysToPay)} fillOpacity={hoveredId === null || hoveredId === p.id ? 0.85 : 0.3} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
