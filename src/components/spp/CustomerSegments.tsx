"use client";

import { useMemo, useState } from "react";
import type { CustomerWithSales } from "@/lib/spp-queries";
import { classifyCustomers, SEGMENT_DEFS, type SegmentKey } from "@/lib/customer-segmentation";

const money = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v).toLocaleString()}`;

export function CustomerSegments({ customers }: { customers: CustomerWithSales[] }) {
  const [open, setOpen] = useState<SegmentKey | null>(null);
  const classified = useMemo(() => classifyCustomers(customers), [customers]);

  const bySegment = useMemo(() => {
    const m = new Map<SegmentKey, typeof classified>();
    for (const c of classified) {
      if (!m.has(c.segment)) m.set(c.segment, []);
      m.get(c.segment)!.push(c);
    }
    return m;
  }, [classified]);

  const excludedCount = bySegment.get("excluded")?.length ?? 0;

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-1">Customer Acquisition Segments</h2>
      <p className="text-[11px] text-text-secondary mb-3">
        B2B customers are tiered by average annual spend and/or lifetime order count; non-business (individual)
        customers are split by whether they&apos;ve bought more than once. Business vs. non-business is inferred
        from the customer name and repeat-purchase behavior — there&apos;s no legal-entity field in the source
        ledger — so treat it as a starting rubric to align with the marketing team, not ground truth. Click a
        segment to drill into the customers in it, sourced from the CRM.
        {excludedCount > 0 && (
          <>
            {" "}
            {excludedCount} account{excludedCount === 1 ? "" : "s"} (e.g. point-of-sale cash-transaction buckets)
            are excluded as aggregate/anomalous, not distinct customers.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SEGMENT_DEFS.map((def) => {
          const rows = bySegment.get(def.key) ?? [];
          const totalSpend = rows.reduce((s, r) => s + (Number(r.customer.lifetime_sales) || 0), 0);
          const avgSpend = rows.length ? totalSpend / rows.length : 0;
          const isOpen = open === def.key;
          return (
            <button
              key={def.key}
              onClick={() => setOpen(isOpen ? null : def.key)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                isOpen ? "border-accent-blue bg-accent-blue/5" : "border-border-custom bg-surface hover:border-accent-blue/40"
              }`}
            >
              <div className="text-sm font-semibold text-foreground">{def.label}</div>
              <div className="text-[10px] text-text-secondary mt-0.5">{def.description}</div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-lg font-bold text-foreground">{rows.length}</span>
                <span className="text-[10px] text-text-secondary">customers</span>
              </div>
              <div className="text-[11px] font-mono text-text-secondary mt-1">
                Avg lifetime spend {money(avgSpend)} · Total {money(totalSpend)}
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="mt-3 overflow-x-auto border border-border-custom rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-surface">
              <tr className="border-b border-border-custom text-text-secondary">
                <th className="text-left py-2 px-3 font-medium">Customer</th>
                <th className="text-right py-2 px-2 font-medium">Lifetime Sales</th>
                <th className="text-right py-2 px-2 font-medium">Lifetime Orders</th>
                <th className="text-right py-2 px-3 font-medium">Avg Annual Spend</th>
              </tr>
            </thead>
            <tbody>
              {(bySegment.get(open) ?? [])
                .sort((a, b) => (Number(b.customer.lifetime_sales) || 0) - (Number(a.customer.lifetime_sales) || 0))
                .map((c) => (
                  <tr key={c.customer.id} className="border-b border-border-custom/50 last:border-0">
                    <td className="py-1.5 px-3">
                      <a href={`/customers/${c.customer.id}`} className="text-accent-blue hover:underline font-mono">
                        {c.customer.name}
                      </a>
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                      {money(Number(c.customer.lifetime_sales) || 0)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-text-secondary">
                      {c.customer.lifetime_sale_count}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-text-secondary">{money(c.avgAnnualSpend)}</td>
                  </tr>
                ))}
              {(bySegment.get(open) ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-center text-text-secondary">
                    No customers in this segment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
