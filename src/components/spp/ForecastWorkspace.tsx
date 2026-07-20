"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export interface ForecastRow {
  id: string;
  scenario: "forecast" | "plan";
  category: string;
  year: number;
  value: number | null;
  is_percent: boolean;
  sort_order: number;
}
export interface DebtRow {
  facility: string; year: number; principal: number | null; interest: number | null; ending_balance: number | null;
}
export interface RevenueMatrixRow {
  year: number; existing_rev: number | null; new_rev: number | null; replacement: number | null; churn: number | null; ending_rev: number | null;
}
export interface OpexGlRow {
  id: string; scenario: "forecast" | "plan"; gl_category: string; year: number; value: number | null; sort_order: number;
}

const money = (v: number | null | undefined) => {
  if (v === null || v === undefined) return "—";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 1_000_000) return `${s}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${s}$${(a / 1_000).toFixed(0)}K`;
  return `${s}$${a.toFixed(0)}`;
};
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${(v * 100).toFixed(1)}%`);
const fmt = (v: number | null | undefined, isPct: boolean) => (isPct ? pct(v) : money(v));
const chartTick = (v: number) => (Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`);

type Tab = "charts" | "pnl" | "variance" | "revenue" | "opex";

export function ForecastWorkspace({
  rows: initialRows, years, debt, revenueMatrix, opexGl: initialOpexGl,
}: { rows: ForecastRow[]; years: number[]; debt: DebtRow[]; revenueMatrix: RevenueMatrixRow[]; opexGl: OpexGlRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [opexGl, setOpexGl] = useState(initialOpexGl);
  const [tab, setTab] = useState<Tab>("charts");
  const [scenario, setScenario] = useState<"forecast" | "plan">("forecast");

  // grids: scenario -> ordered categories -> {is_percent, byYear}
  const grids = useMemo(() => {
    const g: Record<string, { category: string; is_percent: boolean; sort_order: number; byYear: Record<number, ForecastRow> }[]> = { forecast: [], plan: [] };
    for (const sc of ["forecast", "plan"] as const) {
      const byCat = new Map<string, { category: string; is_percent: boolean; sort_order: number; byYear: Record<number, ForecastRow> }>();
      for (const r of rows.filter((x) => x.scenario === sc)) {
        if (!byCat.has(r.category)) byCat.set(r.category, { category: r.category, is_percent: r.is_percent, sort_order: r.sort_order, byYear: {} });
        byCat.get(r.category)!.byYear[r.year] = r;
      }
      g[sc] = [...byCat.values()].sort((a, b) => a.sort_order - b.sort_order);
    }
    return g;
  }, [rows]);

  const chartData = useMemo(() => {
    const find = (sc: string, cat: string, yr: number) =>
      rows.find((r) => r.scenario === sc && r.category === cat && r.year === yr)?.value ?? null;
    return years.map((yr) => ({
      year: String(yr),
      "Sales (Forecast)": find("forecast", "Sales", yr),
      "Sales (Plan)": find("plan", "Sales", yr),
      "EBITDA (Forecast)": find("forecast", "EBITDA", yr),
      "EBITDA (Plan)": find("plan", "EBITDA", yr),
    }));
  }, [rows, years]);

  function onSaved(id: string, value: number | null) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  function onOpexSaved(id: string, value: number | null) {
    setOpexGl((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  return (
    <div>
      <div className="flex gap-1 mb-5 flex-wrap">
        {([["charts", "Charts"], ["pnl", "P&L Grid"], ["variance", "Forecast vs Plan"], ["revenue", "Revenue Build"], ["opex", "OpEx (GL Detail)"]] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-accent-blue text-white" : "text-text-secondary hover:bg-surface border border-border-custom"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "charts" && (
        <div className="bg-surface border border-border-custom rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Revenue & EBITDA — Forecast vs Plan (2022–2031)</h3>
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} barGap={2} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
                <YAxis tickFormatter={chartTick} tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, color: "#1E293B" }}
                  formatter={(v) => money(Number(v))}
                />
                <Legend wrapperStyle={{ color: "#64748B", fontSize: 10 }} />
                <Bar dataKey="Sales (Forecast)" fill="#2563EB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Sales (Plan)" fill="#93C5FD" radius={[3, 3, 0, 0]} />
                <Line dataKey="EBITDA (Forecast)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                <Line dataKey="EBITDA (Plan)" stroke="#6EE7B7" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Bars = Sales, lines = EBITDA. Solid = Forecast, light/dashed = Plan.</p>
        </div>
      )}

      {tab === "pnl" && (
        <div>
          <div className="flex gap-1 mb-3">
            {(["forecast", "plan"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`text-xs px-3 py-1 rounded capitalize transition-colors ${scenario === s ? "bg-accent-green text-white" : "text-text-secondary hover:bg-surface border border-border-custom"}`}
              >
                {s}
              </button>
            ))}
            <span className="text-[11px] text-text-secondary self-center ml-2">Click any cell to edit — this is the live model.</span>
          </div>
          <Grid categories={grids[scenario]} years={years} onSaved={onSaved} />
        </div>
      )}

      {tab === "variance" && <Variance grids={grids} years={years} />}

      {tab === "revenue" && <RevenueBuild revenueMatrix={revenueMatrix} debt={debt} />}

      {tab === "opex" && (
        <OpexGl opexGl={opexGl} lumpRows={rows} years={years} scenario={scenario} setScenario={setScenario} onSaved={onOpexSaved} />
      )}
    </div>
  );
}

function Grid({
  categories, years, onSaved,
}: { categories: { category: string; is_percent: boolean; byYear: Record<number, ForecastRow> }[]; years: number[]; onSaved: (id: string, v: number | null) => void }) {
  return (
    <div className="overflow-x-auto border border-border-custom rounded-lg">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border-custom bg-surface text-text-secondary">
            <th className="text-left py-2 px-3 font-medium">Category</th>
            {years.map((y) => <th key={y} className="text-right py-2 px-2 font-medium">{y}</th>)}
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => {
            const isHeader = ["Sales", "EBITDA", "GM $"].includes(c.category);
            return (
              <tr key={c.category} className={`border-b border-border-custom/50 ${isHeader ? "bg-surface/60" : ""}`}>
                <td className={`py-1.5 px-3 ${isHeader ? "font-semibold text-foreground" : c.is_percent ? "text-text-secondary italic" : "text-text-secondary"}`}>{c.category}</td>
                {years.map((y) => {
                  const row = c.byYear[y];
                  return (
                    <td key={y} className="py-1 px-2 text-right">
                      {row ? <EditableCell row={row} onSaved={onSaved} /> : <span className="text-text-secondary">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditableCell({ row, onSaved }: { row: ForecastRow; onSaved: (id: string, v: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const display = row.is_percent && row.value !== null ? (row.value * 100).toFixed(2) : row.value === null ? "" : String(row.value);
  const [draft, setDraft] = useState(display);

  async function commit() {
    setEditing(false);
    const raw = draft.trim();
    let value: number | null = raw === "" ? null : Number(raw.replace(/[$,%]/g, ""));
    if (value !== null && Number.isNaN(value)) { setDraft(display); return; }
    if (value !== null && row.is_percent) value = value / 100;
    if (value === row.value) return;
    setSaving(true);
    try {
      const res = await fetch("/api/forecast", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, value }),
      });
      if (!res.ok) throw new Error();
      onSaved(row.id, value);
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
        className="w-20 text-right text-xs font-mono border border-accent-blue/40 rounded px-1 py-0.5 focus:outline-none"
      />
    );
  }
  return (
    <button
      onClick={() => { setDraft(display); setEditing(true); }}
      className={`font-mono hover:bg-accent-blue/10 rounded px-1 py-0.5 ${saving ? "opacity-50" : ""} ${row.is_percent ? "text-text-secondary" : "text-foreground"}`}
      title="Click to edit"
    >
      {fmt(row.value, row.is_percent)}
    </button>
  );
}

function Variance({ grids, years }: { grids: Record<string, { category: string; is_percent: boolean; byYear: Record<number, ForecastRow> }[]>; years: number[] }) {
  const cats = grids.forecast.map((c) => c.category);
  const get = (sc: string, cat: string, yr: number) =>
    grids[sc].find((c) => c.category === cat)?.byYear[yr]?.value ?? null;
  return (
    <div className="overflow-x-auto border border-border-custom rounded-lg">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border-custom bg-surface text-text-secondary">
            <th className="text-left py-2 px-3 font-medium">Category (Forecast − Plan)</th>
            {years.map((y) => <th key={y} className="text-right py-2 px-2 font-medium">{y}</th>)}
          </tr>
        </thead>
        <tbody>
          {cats.map((cat) => {
            const isPct = grids.forecast.find((c) => c.category === cat)?.is_percent ?? false;
            return (
              <tr key={cat} className="border-b border-border-custom/50">
                <td className="py-1.5 px-3 text-text-secondary">{cat}</td>
                {years.map((y) => {
                  const f = get("forecast", cat, y), p = get("plan", cat, y);
                  if (f === null || p === null) return <td key={y} className="py-1.5 px-2 text-right text-text-secondary">—</td>;
                  const d = f - p;
                  const nearZero = Math.abs(d) < (isPct ? 0.0001 : 0.5);
                  return (
                    <td key={y} className={`py-1.5 px-2 text-right font-mono ${nearZero ? "text-text-secondary" : d > 0 ? "text-accent-green" : "text-red-600/80"}`}>
                      {nearZero ? "—" : (d > 0 ? "+" : "") + (isPct ? `${(d * 100).toFixed(1)}pp` : money(d))}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OpexGl({
  opexGl, lumpRows, years, scenario, setScenario, onSaved,
}: {
  opexGl: OpexGlRow[];
  lumpRows: ForecastRow[];
  years: number[];
  scenario: "forecast" | "plan";
  setScenario: (s: "forecast" | "plan") => void;
  onSaved: (id: string, v: number | null) => void;
}) {
  const rowsForScenario = opexGl.filter((r) => r.scenario === scenario);
  const categories = useMemo(() => {
    const byCat = new Map<string, { gl_category: string; sort_order: number; byYear: Record<number, OpexGlRow> }>();
    for (const r of rowsForScenario) {
      if (!byCat.has(r.gl_category)) byCat.set(r.gl_category, { gl_category: r.gl_category, sort_order: r.sort_order, byYear: {} });
      byCat.get(r.gl_category)!.byYear[r.year] = r;
    }
    return [...byCat.values()].sort((a, b) => a.sort_order - b.sort_order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opexGl, scenario]);

  const glSumByYear = (y: number) => categories.reduce((s, c) => s + (c.byYear[y]?.value ?? 0), 0);
  const lumpTotalByYear = (y: number) => lumpRows.find((r) => r.scenario === scenario && r.category === "OpEx" && r.year === y)?.value ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        {(["forecast", "plan"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            className={`text-xs px-3 py-1 rounded capitalize transition-colors ${scenario === s ? "bg-accent-green text-white" : "text-text-secondary hover:bg-surface border border-border-custom"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-text-secondary mb-3">
        Standard chart of accounts, seeded once with the known lump OpEx total under &quot;Unclassified&quot; —
        move dollars into named categories as real GL data becomes available. No splits are invented here. Click
        any cell to edit. The Reconciled row shows whether the GL categories sum to the lump OpEx total for that
        year.
      </p>
      <div className="overflow-x-auto border border-border-custom rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-custom bg-surface text-text-secondary">
              <th className="text-left py-2 px-3 font-medium sticky left-0 bg-surface">GL Category</th>
              {years.map((y) => <th key={y} className="text-right py-2 px-2 font-medium whitespace-nowrap">{y}</th>)}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr
                key={c.gl_category}
                className={`border-b border-border-custom/50 ${c.gl_category.startsWith("Unclassified") ? "bg-surface/60 italic" : ""}`}
              >
                <td className="py-1.5 px-3 text-text-secondary whitespace-nowrap sticky left-0 bg-background">{c.gl_category}</td>
                {years.map((y) => {
                  const row = c.byYear[y];
                  return (
                    <td key={y} className="py-1 px-2 text-right">
                      {row ? <OpexGlCell row={row} onSaved={onSaved} /> : <span className="text-text-secondary">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-border-custom font-semibold">
              <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background">Total</td>
              {years.map((y) => (
                <td key={y} className="py-1.5 px-2 text-right font-mono text-foreground whitespace-nowrap">{money(glSumByYear(y))}</td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5 px-3 text-text-secondary sticky left-0 bg-background">Reconciled to Lump OpEx</td>
              {years.map((y) => {
                const lump = lumpTotalByYear(y);
                const sum = glSumByYear(y);
                const reconciled = lump === null || Math.abs(sum - lump) < 0.5;
                return (
                  <td key={y} className={`py-1.5 px-2 text-right font-mono whitespace-nowrap ${lump === null ? "text-text-secondary" : reconciled ? "text-accent-green" : "text-red-600"}`}>
                    {lump === null ? "—" : reconciled ? "✓" : money(sum - lump)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpexGlCell({ row, onSaved }: { row: OpexGlRow; onSaved: (id: string, v: number | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const display = row.value === null ? "" : String(row.value);
  const [draft, setDraft] = useState(display);

  async function commit() {
    setEditing(false);
    const raw = draft.trim();
    const value: number | null = raw === "" ? null : Number(raw.replace(/[$,]/g, ""));
    if (value !== null && Number.isNaN(value)) { setDraft(display); return; }
    if (value === row.value) return;
    setSaving(true);
    try {
      const res = await fetch("/api/forecast-opex-gl", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, value }),
      });
      if (!res.ok) throw new Error();
      onSaved(row.id, value);
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
      className={`font-mono hover:bg-accent-blue/10 rounded px-1 py-0.5 text-foreground ${saving ? "opacity-50" : ""}`}
      title="Click to edit"
    >
      {money(row.value)}
    </button>
  );
}

function RevenueBuild({ revenueMatrix, debt }: { revenueMatrix: RevenueMatrixRow[]; debt: DebtRow[] }) {
  const facilities = [...new Set(debt.map((d) => d.facility))];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Revenue Matrix — Build to Plan</h3>
        {revenueMatrix.length === 0 ? (
          <p className="text-xs text-text-secondary">No revenue matrix loaded.</p>
        ) : (
          <div className="overflow-x-auto border border-border-custom rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-custom bg-surface text-text-secondary">
                  <th className="text-left py-2 px-3 font-medium">Component</th>
                  {revenueMatrix.map((r) => <th key={r.year} className="text-right py-2 px-2 font-medium">{r.year}</th>)}
                </tr>
              </thead>
              <tbody>
                {([["Existing", "existing_rev"], ["New", "new_rev"], ["Replacement", "replacement"], ["Churn", "churn"], ["Ending Revenue", "ending_rev"]] as [string, keyof RevenueMatrixRow][]).map(([label, key]) => (
                  <tr key={label} className={`border-b border-border-custom/50 ${key === "ending_rev" ? "bg-surface/60 font-semibold" : ""}`}>
                    <td className={`py-1.5 px-3 ${key === "ending_rev" ? "text-foreground" : "text-text-secondary"}`}>{label}</td>
                    {revenueMatrix.map((r) => (
                      <td key={r.year} className={`py-1.5 px-2 text-right font-mono ${key === "churn" && Number(r[key]) < 0 ? "text-red-600/80" : key === "ending_rev" ? "text-foreground" : "text-text-secondary"}`}>
                        {money(r[key] as number | null)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Debt Servicing Schedule</h3>
        {debt.length === 0 ? (
          <p className="text-xs text-text-secondary">No debt schedule loaded.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {facilities.map((fac) => {
              const rows = debt.filter((d) => d.facility === fac).sort((a, b) => a.year - b.year);
              return (
                <div key={fac} className="border border-border-custom rounded-lg overflow-hidden">
                  <div className="bg-surface px-3 py-2 text-xs font-semibold text-foreground border-b border-border-custom">{fac}</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-text-secondary border-b border-border-custom/50">
                        <th className="text-left py-1.5 px-3 font-medium">Year</th>
                        <th className="text-right py-1.5 px-2 font-medium">Principal</th>
                        <th className="text-right py-1.5 px-2 font-medium">Interest</th>
                        <th className="text-right py-1.5 px-3 font-medium">Ending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((d) => (
                        <tr key={d.year} className="border-b border-border-custom/40">
                          <td className="py-1.5 px-3 text-text-secondary">{d.year}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(d.principal)}</td>
                          <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(d.interest)}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-foreground">{money(d.ending_balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
