"use client";

import { useMemo, useState } from "react";
import type { DeliveryTask } from "@/lib/spp-queries";
import { DeliveryStatusSelect } from "@/components/spp/DeliveryStatusSelect";
import { EditableCell } from "@/components/spp/EditableCell";
import { deliveryTabLink } from "@/lib/delivery-tab-links";

const YEAR_LABEL: Record<number, string> = {
  1: "Year 1 — Integration & Foundation (2026)",
  2: "Year 2 — Revenue Acceleration (2027)",
  3: "Year 3 — Scale & Expansion (2028)",
  4: "Year 4 — Platform & Portals (2029)",
  5: "Year 5 — Optimize & Exit (2030–31)",
};

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

function k(v: number | null): string {
  return v === null || v === undefined ? "—" : `$${v.toLocaleString()}K`;
}

const ALL = "__all__";

export function DeliveryPlanTable({ initialTasks }: { initialTasks: DeliveryTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [year, setYear] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [system, setSystem] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const years = useMemo(() => [...new Set(tasks.map((t) => t.delivery_year ?? 0))].sort((a, b) => a - b), [tasks]);
  const owners = useMemo(() => [...new Set(tasks.map((t) => t.owner).filter((v): v is string => Boolean(v)))].sort(), [tasks]);
  const systems = useMemo(() => [...new Set(tasks.map((t) => t.system).filter((v): v is string => Boolean(v)))].sort(), [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (year !== ALL && String(t.delivery_year ?? 0) !== year) return false;
      if (owner !== ALL && t.owner !== owner) return false;
      if (system !== ALL && t.system !== system) return false;
      if (status !== ALL && t.status !== status) return false;
      if (dateFrom && (!t.start_date || t.start_date < dateFrom)) return false;
      if (dateTo && (!t.start_date || t.start_date > dateTo)) return false;
      return true;
    });
  }, [tasks, year, owner, system, status, dateFrom, dateTo]);

  const filtersActive = year !== ALL || owner !== ALL || system !== ALL || status !== ALL || dateFrom || dateTo;

  function resetFilters() {
    setYear(ALL);
    setOwner(ALL);
    setSystem(ALL);
    setStatus(ALL);
    setDateFrom("");
    setDateTo("");
  }

  function patchLocal(id: string, field: string, value: unknown) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  const displayYears = [...new Set(filtered.map((t) => t.delivery_year ?? 0))].sort((a, b) => a - b);
  const byYear = (yr: number) => filtered.filter((t) => (t.delivery_year ?? 0) === yr);

  const totalCost = filtered.reduce((s, t) => s + (Number(t.cost_k) || 0), 0);
  const totalBenefit = filtered.reduce((s, t) => s + (Number(t.benefit_k) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 bg-surface border border-border-custom rounded-lg p-3">
        <FilterSelect label="Year" value={year} onChange={setYear} options={years.map((y) => ({ value: String(y), label: YEAR_LABEL[y] ?? `Year ${y}` }))} />
        <FilterSelect label="Owner" value={owner} onChange={setOwner} options={owners.map((o) => ({ value: o, label: o }))} />
        <FilterSelect label="System" value={system} onChange={setSystem} options={systems.map((s) => ({ value: s, label: s }))} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))} />
        <label className="flex items-center gap-1 text-[11px] text-text-secondary">
          Start from
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background" />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-text-secondary">
          to
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background" />
        </label>
        {filtersActive && (
          <button type="button" onClick={resetFilters} className="text-[11px] text-accent-blue hover:underline ml-auto">
            Clear filters
          </button>
        )}
        <span className="text-[11px] text-text-secondary ml-auto sm:ml-0">
          {filtered.length} / {tasks.length} tasks
        </span>
      </div>

      {displayYears.map((yr) => {
        const rows = byYear(yr);
        const yc = rows.reduce((s, t) => s + (Number(t.cost_k) || 0), 0);
        const yb = rows.reduce((s, t) => s + (Number(t.benefit_k) || 0), 0);
        const yDone = rows.filter((t) => t.status === "done").length;
        return (
          <section key={yr}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">{YEAR_LABEL[yr] ?? `Year ${yr}`}</h2>
              <span className="text-[11px] text-text-secondary">
                {rows.length} tasks · {yDone} done · Cost {k(yc)} · Benefit {k(yb)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden mb-3 border border-border-custom">
              <div className="h-full bg-accent-green" style={{ width: rows.length ? `${(yDone / rows.length) * 100}%` : "0%" }} />
            </div>
            <div className="overflow-x-auto border border-border-custom rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-custom bg-surface text-text-secondary">
                    <th className="text-left py-2 px-3 font-medium">Initiative</th>
                    <th className="text-left py-2 px-2 font-medium">System</th>
                    <th className="text-left py-2 px-2 font-medium">Tab</th>
                    <th className="text-left py-2 px-2 font-medium">Next Step</th>
                    <th className="text-center py-2 px-2 font-medium">Owner</th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap">Start</th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap">End</th>
                    <th className="text-right py-2 px-2 font-medium">Cost</th>
                    <th className="text-right py-2 px-2 font-medium">Benefit</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b border-border-custom/50 hover:bg-surface/50">
                      <td className="py-1 px-3 text-foreground font-medium max-w-[220px]">
                        <EditableCell id={t.id} field="title" value={t.title} onSaved={(v) => patchLocal(t.id, "title", v)} />
                      </td>
                      <td className="py-1 px-2">
                        <EditableCell id={t.id} field="system" value={t.system} placeholder="—" onSaved={(v) => patchLocal(t.id, "system", v)} />
                      </td>
                      <td className="py-1 px-2">
                        <TabLinkCell system={t.system} />
                      </td>
                      <td className="py-1 px-2 text-text-secondary max-w-[200px]">
                        <EditableCell id={t.id} field="next_step" value={t.next_step} onSaved={(v) => patchLocal(t.id, "next_step", v)} />
                      </td>
                      <td className="py-1 px-2 text-center text-text-secondary">
                        <EditableCell id={t.id} field="owner" value={t.owner} align="center" onSaved={(v) => patchLocal(t.id, "owner", v)} />
                      </td>
                      <td className="py-1 px-2 text-right text-text-secondary whitespace-nowrap font-mono">
                        <EditableCell id={t.id} field="start_date" value={t.start_date} type="date" align="right" onSaved={(v) => patchLocal(t.id, "start_date", v)} />
                      </td>
                      <td className="py-1 px-2 text-right text-text-secondary whitespace-nowrap font-mono">
                        <EditableCell id={t.id} field="end_date" value={t.end_date} type="date" align="right" onSaved={(v) => patchLocal(t.id, "end_date", v)} />
                      </td>
                      <td className="py-1 px-2 text-right font-mono text-text-secondary">
                        <EditableCell id={t.id} field="cost_k" value={t.cost_k} type="number" align="right" mono onSaved={(v) => patchLocal(t.id, "cost_k", v)} />
                      </td>
                      <td className="py-1 px-2 text-right font-mono text-accent-green">
                        <EditableCell id={t.id} field="benefit_k" value={t.benefit_k} type="number" align="right" mono onSaved={(v) => patchLocal(t.id, "benefit_k", v)} />
                      </td>
                      <td className="py-2 px-3">
                        <DeliveryStatusSelect id={t.id} initial={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center text-sm text-text-secondary py-10 border border-dashed border-border-custom rounded-lg">
          No tasks match the current filters.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex justify-end gap-6 text-xs text-text-secondary border-t border-border-custom pt-4">
          <span>Total Cost: <b className="text-foreground font-mono">{k(totalCost)}</b></span>
          <span>Total Benefit: <b className="text-accent-green font-mono">{k(totalBenefit)}</b></span>
        </div>
      )}
    </div>
  );
}

function TabLinkCell({ system }: { system: string | null }) {
  const link = deliveryTabLink(system);
  if (!link) return <span className="text-text-secondary">—</span>;
  return (
    <a href={link.href} className="text-accent-blue hover:underline whitespace-nowrap">
      {link.label} →
    </a>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1 text-[11px] text-text-secondary">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
      >
        <option value={ALL}>All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
