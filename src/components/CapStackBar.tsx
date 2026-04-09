"use client";

import { capStack, totalRaise } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export function CapStackBar() {
  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-10 rounded-lg overflow-hidden mb-4">
        {capStack.map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${t.pct}%`, backgroundColor: t.color }}
            title={`${t.name}: ${formatCurrency(t.amount, true)} (${t.pct}%)`}
          >
            {t.pct > 15 ? `${t.pct}%` : ""}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {capStack.map((t) => (
          <div key={t.name} className="flex items-start gap-2">
            <div className="w-3 h-3 rounded-sm mt-0.5 shrink-0" style={{ backgroundColor: t.color }} />
            <div>
              <div className="text-sm font-medium text-foreground">{t.name}</div>
              <div className="text-xs text-text-secondary">
                {formatCurrency(t.amount, true)} — {t.terms}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center gap-2">
        <span className="bg-accent-green/20 text-accent-green text-xs font-medium px-2 py-1 rounded">
          Sources = Uses ✓ {formatCurrency(totalRaise, true)}
        </span>
      </div>
    </div>
  );
}
