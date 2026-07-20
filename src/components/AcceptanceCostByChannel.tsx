"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import {
  acceptanceChannels,
  acceptanceCostOutLevers,
  acceptanceRevenueDefault,
  acceptanceBaseEbitda,
  type AcceptanceChannel,
} from "@/lib/data";

// ─── Formatting helpers ──────────────────────────────────────────────────────
function money(val: number): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}
function dollars(val: number): string {
  return `$${Math.round(val).toLocaleString("en-US")}`;
}
function bps(rateFraction: number): string {
  return `${Math.round(rateFraction * 10_000)} bps`;
}

// ─── Compute a channel row ───────────────────────────────────────────────────
interface ChannelRow extends AcceptanceChannel {
  volume: number; // $ processed through the channel
  baseCost: number; // $ acceptance cost before levers
  optimizedCost: number; // $ acceptance cost after enabled levers
  savings: number;
}

export function AcceptanceCostByChannel() {
  const [revenue, setRevenue] = useState<number>(acceptanceRevenueDefault);
  const [channels, setChannels] = useState<AcceptanceChannel[]>(
    acceptanceChannels.map((c) => ({ ...c }))
  );
  const [levers, setLevers] = useState(
    acceptanceCostOutLevers.map((l) => ({ ...l, enabled: l.enabledByDefault, reductionPct: l.reductionPct }))
  );

  function updateChannel(idx: number, field: "mixPct" | "feeRate", value: number) {
    setChannels((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }
  function toggleLever(id: string) {
    setLevers((prev) => prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)));
  }
  function updateLeverReduction(id: string, value: number) {
    setLevers((prev) => prev.map((l) => (l.id === id ? { ...l, reductionPct: value } : l)));
  }
  function reset() {
    setRevenue(acceptanceRevenueDefault);
    setChannels(acceptanceChannels.map((c) => ({ ...c })));
    setLevers(acceptanceCostOutLevers.map((l) => ({ ...l, enabled: l.enabledByDefault, reductionPct: l.reductionPct })));
  }

  const { rows, totals } = useMemo(() => {
    const mixSum = channels.reduce((s, c) => s + c.mixPct, 0) || 1;
    const rows: ChannelRow[] = channels.map((c) => {
      // Normalize mix so volume always ties to total revenue even if inputs don't sum to 100.
      const volume = revenue * (c.mixPct / mixSum);
      const baseCost = volume * (c.feeRate / 100);
      // Stack enabled levers multiplicatively on the channels they target.
      let remaining = 1;
      for (const l of levers) {
        if (l.enabled && l.targetChannels.includes(c.channel)) {
          remaining *= 1 - Math.min(Math.max(l.reductionPct, 0), 100) / 100;
        }
      }
      const optimizedCost = baseCost * remaining;
      return { ...c, volume, baseCost, optimizedCost, savings: baseCost - optimizedCost };
    });

    const baseCost = rows.reduce((s, r) => s + r.baseCost, 0);
    const optimizedCost = rows.reduce((s, r) => s + r.optimizedCost, 0);
    const savings = baseCost - optimizedCost;
    return {
      rows,
      totals: {
        volume: revenue,
        baseCost,
        optimizedCost,
        savings,
        baseRate: baseCost / revenue,
        optimizedRate: optimizedCost / revenue,
        mixSum,
      },
    };
  }, [revenue, channels, levers]);

  const mixOff = Math.abs(totals.mixSum - 100) > 0.01;
  const savingsPctOfEbitda = (totals.savings / acceptanceBaseEbitda) * 100;

  const chartData = rows.map((r) => ({ name: r.channel, base: Math.round(r.baseCost), optimized: Math.round(r.optimizedCost), color: r.color }));

  return (
    <div className="space-y-8" id="acceptance-cost">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Cost of Acceptance by Channel</h2>
        <p className="text-sm text-text-secondary max-w-3xl">
          A proxy model of what it costs Tile Center Group to <em>get paid</em>. Payment mix and effective
          acceptance rates are editable so the model can be re-based off the target&apos;s real processor
          statements. Card acceptance is a hidden margin leak — every dollar removed drops straight to EBITDA,
          making this a clean financial-engineering cost-out lever alongside SCF and the COGS audit.
        </p>
      </div>

      {/* Headline stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Annual Acceptance Cost" value={money(totals.baseCost)} sub={`${(totals.baseRate * 100).toFixed(2)}% blended · ${bps(totals.baseRate)}`} tone="amber" />
        <StatTile label="Optimized Cost" value={money(totals.optimizedCost)} sub={`${(totals.optimizedRate * 100).toFixed(2)}% blended · ${bps(totals.optimizedRate)}`} tone="blue" />
        <StatTile label="Annual Savings" value={money(totals.savings)} sub={`${bps(totals.baseRate - totals.optimizedRate)} out of blended rate`} tone="green" />
        <StatTile label="EBITDA Impact" value={`+${money(totals.savings)}`} sub={`${savingsPctOfEbitda.toFixed(1)}% of $${(acceptanceBaseEbitda / 1000).toFixed(0)}K base EBITDA`} tone="green" />
      </div>

      {/* Revenue control */}
      <div className="bg-surface border border-border-custom rounded-lg p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-text-secondary font-semibold mb-1">Annual Collected Volume</label>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">$</span>
            <input
              type="number"
              value={revenue}
              min={0}
              step={50_000}
              onChange={(e) => setRevenue(Math.max(0, Number(e.target.value)))}
              className="w-36 bg-background border border-border-custom rounded px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:border-accent-blue"
            />
          </div>
        </div>
        <div className="text-xs text-text-secondary">
          Defaults to LTM revenue of <b className="text-foreground">$4.95M</b>. Adjust mix % and effective rate per channel below.
        </div>
        <button
          onClick={reset}
          className="ml-auto text-xs px-3 py-1.5 rounded border border-border-custom text-text-secondary hover:text-foreground hover:bg-background transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      {/* Channel table */}
      <div className="bg-surface border border-border-custom rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Acceptance Cost by Channel</h3>
          {mixOff && (
            <span className="text-[10px] text-accent-amber bg-accent-amber/10 px-2 py-1 rounded">
              Mix sums to {totals.mixSum.toFixed(0)}% — volumes normalized to 100%
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-custom text-text-secondary">
                <th className="text-left py-2 px-2 font-medium">Channel</th>
                <th className="text-right py-2 px-2 font-medium">Mix %</th>
                <th className="text-right py-2 px-2 font-medium">$ Volume</th>
                <th className="text-right py-2 px-2 font-medium">Eff. Rate %</th>
                <th className="text-right py-2 px-2 font-medium">$ Cost</th>
                <th className="text-right py-2 px-2 font-medium">$ Optimized</th>
                <th className="text-right py-2 px-2 font-medium">$ Saved</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.channel} className="border-b border-border-custom/50">
                  <td className="py-1.5 px-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="font-medium text-foreground">{r.channel}</span>
                    </span>
                    <div className="text-[10px] text-text-secondary pl-[18px] leading-tight">{r.note}</div>
                  </td>
                  <td className="py-1.5 px-2 text-right">
                    <NumberInput value={r.mixPct} step={1} onChange={(v) => updateChannel(i, "mixPct", v)} suffix="%" />
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(r.volume)}</td>
                  <td className="py-1.5 px-2 text-right">
                    <NumberInput value={r.feeRate} step={0.05} onChange={(v) => updateChannel(i, "feeRate", v)} suffix="%" />
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-foreground">{dollars(r.baseCost)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-accent-blue">{dollars(r.optimizedCost)}</td>
                  <td className={`py-1.5 px-2 text-right font-mono font-medium ${r.savings > 0.5 ? "text-accent-green" : "text-text-secondary"}`}>
                    {r.savings > 0.5 ? dollars(r.savings) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border-custom bg-background/40 font-semibold">
                <td className="py-2 px-2 text-foreground">Total</td>
                <td className="py-2 px-2 text-right font-mono text-foreground">{totals.mixSum.toFixed(0)}%</td>
                <td className="py-2 px-2 text-right font-mono text-foreground">{money(totals.volume)}</td>
                <td className="py-2 px-2 text-right font-mono text-foreground">{(totals.baseRate * 100).toFixed(2)}%</td>
                <td className="py-2 px-2 text-right font-mono text-foreground">{dollars(totals.baseCost)}</td>
                <td className="py-2 px-2 text-right font-mono text-accent-blue">{dollars(totals.optimizedCost)}</td>
                <td className="py-2 px-2 text-right font-mono text-accent-green">{dollars(totals.savings)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-border-custom rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">$ Acceptance Cost by Channel</h3>
        <p className="text-[11px] text-text-secondary mb-3">
          Solid = current cost, hatched overlay = cost after enabled cost-out levers.
        </p>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={-18} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={{ stroke: "#E2E8F0" }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tickFormatter={(v) => money(Number(v))} tick={{ fill: "#64748B", fontSize: 11 }} axisLine={{ stroke: "#E2E8F0" }} />
              <Tooltip
                cursor={{ fill: "rgba(37,99,235,0.05)" }}
                contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(value, name) => [dollars(Number(value)), name === "base" ? "Current" : "Optimized"]}
              />
              <Bar dataKey="base" radius={[3, 3, 0, 0]} barSize={26} fillOpacity={0.3}>
                {chartData.map((d) => (
                  <Cell key={`b-${d.name}`} fill={d.color} />
                ))}
              </Bar>
              <Bar dataKey="optimized" radius={[3, 3, 0, 0]} barSize={26}>
                {chartData.map((d) => (
                  <Cell key={`o-${d.name}`} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost-out levers */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Cost-Out Initiative</h3>
        <p className="text-[11px] text-text-secondary mb-3">
          Toggle levers and tune the reduction each achieves. Enabled levers stack multiplicatively on the
          cost of the channels they touch. Operational levers are on by default; strategic pricing levers
          (ACH steering, surcharging) are off and represent incremental upside.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {levers.map((l) => (
            <div
              key={l.id}
              className={`border rounded-lg p-3 transition-colors ${
                l.enabled ? "border-accent-green/40 bg-accent-green/5" : "border-border-custom bg-surface"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleLever(l.id)}
                  role="switch"
                  aria-checked={l.enabled}
                  className={`mt-0.5 relative w-9 h-5 rounded-full shrink-0 transition-colors ${l.enabled ? "bg-accent-green" : "bg-border-custom"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${l.enabled ? "translate-x-4" : ""}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{l.name}</span>
                    {l.strategic && (
                      <span className="text-[9px] uppercase tracking-wide text-accent-purple bg-accent-purple/10 px-1.5 py-0.5 rounded">Strategic</span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">{l.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wide">Reduction</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={l.reductionPct}
                      disabled={!l.enabled}
                      onChange={(e) => updateLeverReduction(l.id, Number(e.target.value))}
                      className="flex-1 accent-accent-green disabled:opacity-40"
                    />
                    <span className="text-xs font-mono font-semibold text-foreground w-10 text-right">{l.reductionPct}%</span>
                  </div>
                  <div className="text-[10px] text-text-secondary mt-1">
                    Targets: {l.targetChannels.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before / after summary */}
      <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-accent-green uppercase mb-3">Cost-Out Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <SummaryStat label="Current Cost" value={dollars(totals.baseCost)} sub={`${(totals.baseRate * 100).toFixed(2)}% of volume`} />
          <SummaryStat label="Target Cost" value={dollars(totals.optimizedCost)} sub={`${(totals.optimizedRate * 100).toFixed(2)}% of volume`} accent />
          <SummaryStat label="Annual Savings" value={dollars(totals.savings)} sub={`${totals.baseCost > 0 ? ((totals.savings / totals.baseCost) * 100).toFixed(0) : 0}% of acceptance cost`} accent />
          <SummaryStat label="Pro-Forma EBITDA" value={money(acceptanceBaseEbitda + totals.savings)} sub={`+${savingsPctOfEbitda.toFixed(1)}% vs. base`} accent />
        </div>
      </div>

      <p className="text-[10px] text-text-secondary">
        Estimates for planning only. Effective rates blend interchange, network assessments and processor
        markup; refresh with 3 months of the target&apos;s merchant-processing statements during diligence.
        Surcharge/cash-discount programs are subject to state law and card-network rules — Georgia permits
        credit-card surcharging up to 3%; debit cards may not be surcharged.
      </p>
    </div>
  );
}

// ─── Small building blocks ───────────────────────────────────────────────────
function NumberInput({ value, step, onChange, suffix }: { value: number; step: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <input
        type="number"
        value={value}
        step={step}
        min={0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-16 bg-background border border-border-custom rounded px-1.5 py-1 text-right text-xs font-mono text-foreground focus:outline-none focus:border-accent-blue"
      />
      {suffix && <span className="text-[10px] text-text-secondary">{suffix}</span>}
    </span>
  );
}

function StatTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "blue" | "green" | "amber" }) {
  const toneMap = {
    blue: "text-accent-blue",
    green: "text-accent-green",
    amber: "text-accent-amber",
  } as const;
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${toneMap[tone]}`}>{value}</div>
      <div className="text-[10px] text-text-secondary mt-1">{sub}</div>
    </div>
  );
}

function SummaryStat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">{label}</div>
      <div className={`text-xl font-bold mt-1 ${accent ? "text-accent-green" : "text-foreground"}`}>{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5">{sub}</div>
    </div>
  );
}
