"use client";

import { useState } from "react";
import type { MonthlyPerformanceRow } from "@/lib/spp-queries";

const MONTH_LABEL = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const CATEGORY_ORDER = ["Revenue", "EBITDA", "Free Cash Flow", "Cash Balance"] as const;

function money(v: number | null): string {
  if (v === null || v === undefined) return "—";
  const abs = Math.round(Math.abs(v)).toLocaleString();
  return v < 0 ? `($${abs})` : `$${abs}`;
}

export function MonthlySummaryGrid({ rows: initialRows }: { rows: MonthlyPerformanceRow[] }) {
  const [rows, setRows] = useState(initialRows);

  function patchLocal(id: string, field: "plan_value" | "actual_value", value: number | null) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  return (
    <div className="space-y-8">
      {CATEGORY_ORDER.map((category) => {
        const catRows = rows.filter((r) => r.category === category);
        if (catRows.length === 0) return null;

        // Index this metric's rows by month so months become the columns.
        const byMonth = new Map<number, MonthlyPerformanceRow>();
        catRows.forEach((r) => byMonth.set(r.month, r));
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        const planTotal = catRows.reduce((s, r) => s + (r.plan_value ?? 0), 0);
        const actualTotal = catRows.reduce((s, r) => s + (r.actual_value ?? 0), 0);
        const hasAnyActual = catRows.some((r) => r.actual_value !== null);
        // Cash Balance is a point-in-time stock, not a flow — a full-year "total" is
        // meaningless, so show the latest entered month instead of a sum.
        const isStock = category === "Cash Balance";

        return (
          <div key={category}>
            <h3 className="text-xs font-semibold text-foreground mb-1.5">{category}</h3>
            <div className="overflow-x-auto border border-border-custom rounded-lg">
              <table className="text-xs border-collapse">
                <thead className="bg-surface">
                  <tr className="border-b border-border-custom text-text-secondary">
                    <th className="sticky left-0 z-10 bg-surface text-left py-2 px-3 font-medium whitespace-nowrap">
                      {category === "Cash Balance" ? "Cash" : category === "Free Cash Flow" ? "FCF" : category}
                    </th>
                    {months.map((m) => (
                      <th key={m} className="text-right py-2 px-2.5 font-medium whitespace-nowrap min-w-[68px]">
                        {MONTH_LABEL[m - 1]}
                      </th>
                    ))}
                    <th className="text-right py-2 px-3 font-semibold whitespace-nowrap border-l border-border-custom">
                      {isStock ? "Latest" : "FY 2026"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <MetricRow
                    label="Plan"
                    months={months}
                    byMonth={byMonth}
                    field="plan_value"
                    total={isStock ? latestValue(catRows, "plan_value") : planTotal}
                    onSaved={patchLocal}
                  />
                  <MetricRow
                    label="Actual"
                    months={months}
                    byMonth={byMonth}
                    field="actual_value"
                    total={hasAnyActual ? (isStock ? latestValue(catRows, "actual_value") : actualTotal) : null}
                    onSaved={patchLocal}
                  />
                  <VarianceRow months={months} byMonth={byMonth} isStock={isStock} />
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function latestValue(
  rows: MonthlyPerformanceRow[],
  field: "plan_value" | "actual_value",
): number | null {
  const withValue = rows.filter((r) => r[field] !== null).sort((a, b) => b.month - a.month);
  return withValue.length ? (withValue[0][field] as number) : null;
}

function MetricRow({
  label,
  months,
  byMonth,
  field,
  total,
  onSaved,
}: {
  label: string;
  months: number[];
  byMonth: Map<number, MonthlyPerformanceRow>;
  field: "plan_value" | "actual_value";
  total: number | null;
  onSaved: (id: string, field: "plan_value" | "actual_value", value: number | null) => void;
}) {
  return (
    <tr className="border-b border-border-custom/50">
      <th className="sticky left-0 z-10 bg-background text-left py-1.5 px-3 font-medium text-text-secondary whitespace-nowrap">
        {label}
      </th>
      {months.map((m) => {
        const row = byMonth.get(m);
        return (
          <td key={m} className="py-1 px-2.5 text-right">
            {row ? (
              <Cell id={row.id} field={field} value={row[field]} onSaved={onSaved} />
            ) : (
              <span className="text-text-secondary">—</span>
            )}
          </td>
        );
      })}
      <td className="py-1.5 px-3 text-right font-mono font-semibold text-foreground border-l border-border-custom whitespace-nowrap">
        {money(total)}
      </td>
    </tr>
  );
}

function VarianceRow({
  months,
  byMonth,
  isStock,
}: {
  months: number[];
  byMonth: Map<number, MonthlyPerformanceRow>;
  isStock: boolean;
}) {
  let planTotal = 0;
  let actualTotal = 0;
  let hasActual = false;
  byMonth.forEach((r) => {
    planTotal += r.plan_value ?? 0;
    actualTotal += r.actual_value ?? 0;
    if (r.actual_value !== null) hasActual = true;
  });
  const totalVar = hasActual && !isStock ? actualTotal - planTotal : null;

  return (
    <tr>
      <th className="sticky left-0 z-10 bg-background text-left py-1.5 px-3 font-medium text-text-secondary whitespace-nowrap">
        Var
      </th>
      {months.map((m) => {
        const row = byMonth.get(m);
        const variance =
          row && row.plan_value !== null && row.actual_value !== null
            ? row.actual_value - row.plan_value
            : null;
        return (
          <td
            key={m}
            className={`py-1.5 px-2.5 text-right font-mono whitespace-nowrap ${varianceClass(variance)}`}
          >
            {variance === null ? "—" : money(variance)}
          </td>
        );
      })}
      <td
        className={`py-1.5 px-3 text-right font-mono font-semibold border-l border-border-custom whitespace-nowrap ${varianceClass(totalVar)}`}
      >
        {totalVar === null ? "—" : money(totalVar)}
      </td>
    </tr>
  );
}

function varianceClass(v: number | null): string {
  if (v === null) return "text-text-secondary";
  return v >= 0 ? "text-accent-green" : "text-accent-red";
}

function Cell({
  id,
  field,
  value,
  onSaved,
}: {
  id: string;
  field: "plan_value" | "actual_value";
  value: number | null;
  onSaved: (id: string, field: "plan_value" | "actual_value", value: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState(value === null ? "" : String(value));

  async function commit() {
    setEditing(false);
    const raw = draft.trim();
    const next: number | null = raw === "" ? null : Number(raw.replace(/[$,]/g, ""));
    if (next !== null && Number.isNaN(next)) {
      setDraft(value === null ? "" : String(value));
      return;
    }
    if (next === value) return;
    setSaving(true);
    setError(false);
    try {
      const res = await fetch("/api/monthly-performance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value: next }),
      });
      if (!res.ok) throw new Error();
      onSaved(id, field, next);
    } catch {
      setDraft(value === null ? "" : String(value));
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value === null ? "" : String(value));
            setEditing(false);
          }
        }}
        className="w-20 text-right text-xs font-mono border border-accent-blue/40 rounded px-1 py-0.5 focus:outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value === null ? "" : String(value));
        setEditing(true);
      }}
      className={`font-mono hover:bg-accent-blue/10 rounded px-1 py-0.5 ${saving ? "opacity-50" : ""} ${
        value === null ? "text-text-secondary" : "text-foreground"
      }`}
      title="Click to edit"
    >
      {money(value)}
      {error && <span className="ml-1 text-[9px] text-red-600">!</span>}
    </button>
  );
}
