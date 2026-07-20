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
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const catRows = rows
          .filter((r) => r.category === category)
          .sort((a, b) => a.month - b.month);
        if (catRows.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-xs font-semibold text-foreground mb-1.5">{category}</h3>
            <div className="overflow-x-auto border border-border-custom rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-surface">
                  <tr className="border-b border-border-custom text-text-secondary">
                    <th className="text-left py-2 px-3 font-medium">Month</th>
                    <th className="text-right py-2 px-2 font-medium">Plan</th>
                    <th className="text-right py-2 px-2 font-medium">Actual</th>
                    <th className="text-right py-2 px-3 font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {catRows.map((r) => {
                    const variance =
                      r.plan_value !== null && r.actual_value !== null ? r.actual_value - r.plan_value : null;
                    const variancePct =
                      variance !== null && r.plan_value ? (variance / Math.abs(r.plan_value)) * 100 : null;
                    return (
                      <tr key={r.id} className="border-b border-border-custom/50 last:border-0">
                        <td className="py-1.5 px-3 font-mono text-text-secondary whitespace-nowrap">
                          {MONTH_LABEL[r.month - 1]} {r.year}
                        </td>
                        <td className="py-1 px-2 text-right">
                          <Cell id={r.id} field="plan_value" value={r.plan_value} onSaved={patchLocal} />
                        </td>
                        <td className="py-1 px-2 text-right">
                          <Cell id={r.id} field="actual_value" value={r.actual_value} onSaved={patchLocal} />
                        </td>
                        <td
                          className={`py-1.5 px-3 text-right font-mono ${
                            variance === null
                              ? "text-text-secondary"
                              : variance >= 0
                                ? "text-accent-green"
                                : "text-accent-red"
                          }`}
                        >
                          {variance === null
                            ? "—"
                            : `${money(variance)}${variancePct !== null ? ` (${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%)` : ""}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
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
        className="w-24 text-right text-xs font-mono border border-accent-blue/40 rounded px-1 py-0.5 focus:outline-none"
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
