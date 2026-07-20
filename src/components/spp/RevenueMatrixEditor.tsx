"use client";

import { useState } from "react";
import type { RevenueMatrixRow } from "@/lib/spp-queries";

const money = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

export function RevenueMatrixEditor({ initial }: { initial: RevenueMatrixRow[] }) {
  const [revenueMatrix, setRevenueMatrix] = useState(initial);
  const latest = revenueMatrix[revenueMatrix.length - 1];

  return (
    <div className="space-y-4">
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi label={`${latest.year} Existing`} value={money(latest.existing_rev)} />
          <Kpi label={`${latest.year} New`} value={money(latest.new_rev)} accent="green" />
          <Kpi label={`${latest.year} Replacement`} value={money(latest.replacement)} />
          <Kpi label={`${latest.year} Churn`} value={money(latest.churn)} accent="red" />
          <Kpi label={`${latest.year} Ending`} value={money(latest.ending_rev)} />
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-foreground mb-1">Revenue Build</h2>
        <p className="text-[11px] text-text-secondary mb-2">
          Churn is editable and drives the model — changing a year&apos;s churn recomputes that year&apos;s
          ending revenue and cascades forward through every later year&apos;s starting point.
        </p>
        {revenueMatrix.length === 0 ? (
          <p className="text-xs text-text-secondary">No revenue matrix loaded yet.</p>
        ) : (
          <div className="overflow-x-auto border border-border-custom rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-surface">
                <tr className="border-b border-border-custom text-text-secondary">
                  <th className="text-left py-2 px-3 font-medium">Year</th>
                  <th className="text-right py-2 px-2 font-medium">Existing</th>
                  <th className="text-right py-2 px-2 font-medium">New</th>
                  <th className="text-right py-2 px-2 font-medium">Replacement</th>
                  <th className="text-right py-2 px-2 font-medium">Churn</th>
                  <th className="text-right py-2 px-3 font-medium">Ending</th>
                </tr>
              </thead>
              <tbody>
                {revenueMatrix.map((r) => (
                  <tr key={r.year} className="border-b border-border-custom/50 last:border-0">
                    <td className="py-1.5 px-3 font-mono text-foreground">{r.year}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(r.existing_rev)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-accent-green">{money(r.new_rev)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(r.replacement)}</td>
                    <td className="py-1 px-2 text-right">
                      <ChurnCell row={r} onSaved={setRevenueMatrix} />
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-foreground font-semibold">{money(r.ending_rev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ChurnCell({
  row, onSaved,
}: { row: RevenueMatrixRow; onSaved: (matrix: RevenueMatrixRow[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const display = row.churn === null ? "" : String(row.churn);
  const [draft, setDraft] = useState(display);

  async function commit() {
    setEditing(false);
    const raw = draft.trim();
    const value: number | null = raw === "" ? null : Number(raw.replace(/[$,]/g, ""));
    if (value !== null && Number.isNaN(value)) { setDraft(display); return; }
    if (value === row.churn) return;
    setSaving(true);
    try {
      const res = await fetch("/api/revenue-matrix", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, value }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      onSaved(json.revenueMatrix as RevenueMatrixRow[]);
    } catch {
      setDraft(display);
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
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(display); setEditing(false); } }}
        className="w-24 text-right text-xs font-mono border border-accent-blue/40 rounded px-1 py-0.5 focus:outline-none"
      />
    );
  }
  return (
    <button
      onClick={() => { setDraft(display); setEditing(true); }}
      className={`font-mono hover:bg-accent-blue/10 rounded px-1 py-0.5 ${saving ? "opacity-50" : ""} ${Number(row.churn) < 0 ? "text-red-600/80" : "text-text-secondary"}`}
      title="Click to edit — recalculates this year and cascades forward"
    >
      {money(row.churn)}
    </button>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "green" | "red" }) {
  const color = accent === "green" ? "text-accent-green" : accent === "red" ? "text-accent-red" : "text-foreground";
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
