"use client";

import { useState } from "react";
import { incomeStatement, incomeStatementYears } from "@/lib/data";

function formatVal(val: number | null): string {
  if (val === null) return "—";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
}

export function IncomeStatementTable() {
  const [expanded, setExpanded] = useState(false);

  const visibleRows = expanded
    ? incomeStatement
    : incomeStatement.filter((r) => r.isHeader);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Income Statement</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
        >
          {expanded ? "Collapse" : "Expand All Rows"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-custom">
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Line Item</th>
              {incomeStatementYears.map((y) => (
                <th key={y} className="text-right py-2 px-2 text-text-secondary font-medium">{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.label} className={`border-b border-border-custom/50 ${row.isHeader ? "bg-surface" : ""}`}>
                <td className={`py-1.5 px-2 ${row.isHeader ? "font-semibold text-foreground" : "text-text-secondary pl-4"}`}>
                  {row.label}
                </td>
                {row.values.map((val, i) => (
                  <td
                    key={i}
                    className={`py-1.5 px-2 text-right font-mono ${
                      row.isHeader ? "font-semibold text-foreground" : "text-text-secondary"
                    } ${val !== null && val < 0 ? "text-red-600/80" : ""}`}
                  >
                    {formatVal(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-text-secondary mt-2">
        Post-LBO D&A: $61,364/yr (includes $36,364 real estate depreciation at 27.5-yr SL).
        2026E+ EBITDA includes LBO add-backs and initiative contributions.
      </p>
    </div>
  );
}
