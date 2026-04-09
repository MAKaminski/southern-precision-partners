"use client";

import { useState } from "react";

interface Region {
  name: string;
  coords: { cx: number; cy: number };
  status: "active" | "expansion" | "target";
  metrics: { builders: number; population: string; constructionGrowth: string; medianHome: string };
  description: string;
}

const regions: Region[] = [
  { name: "Atlanta / N. Georgia", coords: { cx: 145, cy: 320 }, status: "active", metrics: { builders: 50, population: "6.2M metro", constructionGrowth: "+8.2% YoY", medianHome: "$385K" }, description: "Home base — Tile Center Group HQ. 3 years of established relationships. Primary revenue center." },
  { name: "Augusta, GA", coords: { cx: 235, cy: 295 }, status: "active", metrics: { builders: 12, population: "611K metro", constructionGrowth: "+5.1% YoY", medianHome: "$245K" }, description: "Active secondary market. Existing delivery routes. Growing military and healthcare construction." },
  { name: "Florence, SC", coords: { cx: 370, cy: 220 }, status: "active", metrics: { builders: 8, population: "206K metro", constructionGrowth: "+3.8% YoY", medianHome: "$195K" }, description: "Satellite location — needs optimization. Florence Optimization initiative targets +$28K EBITDA restoration." },
  { name: "Columbia, SC", coords: { cx: 310, cy: 260 }, status: "expansion", metrics: { builders: 35, population: "850K metro", constructionGrowth: "+9.1% YoY", medianHome: "$275K" }, description: "TOP PRIORITY expansion market. State capital + university town. Mungo Homes, Great Southern HQ here. Target: +$400K revenue via Location 3." },
  { name: "Charleston, SC", coords: { cx: 385, cy: 310 }, status: "target", metrics: { builders: 45, population: "820K metro", constructionGrowth: "+11.3% YoY", medianHome: "$425K" }, description: "Highest growth market in SC. Premium tile demand from luxury coastal homes. High ASP opportunity." },
  { name: "Greenville, SC", coords: { cx: 230, cy: 195 }, status: "target", metrics: { builders: 28, population: "950K metro (Upstate)", constructionGrowth: "+7.6% YoY", medianHome: "$310K" }, description: "BMW/Michelin corridor driving commercial + residential growth. I-85 industrial corridor alignment." },
  { name: "Myrtle Beach, SC", coords: { cx: 430, cy: 250 }, status: "target", metrics: { builders: 22, population: "480K metro", constructionGrowth: "+12.8% YoY", medianHome: "$295K" }, description: "Fastest-growing metro. Hospitality renovation cycle + new residential. High seasonal demand." },
  { name: "Charlotte, NC", coords: { cx: 255, cy: 155 }, status: "target", metrics: { builders: 60, population: "2.7M metro", constructionGrowth: "+10.2% YoY", medianHome: "$395K" }, description: "SPP headquarters market. Massive builder base. I-77 corridor. Future Phase 3+ expansion." },
];

const statusConfig = {
  active: { color: "#2563EB", label: "Active Market", ring: "ring-blue-500/30" },
  expansion: { color: "#059669", label: "Priority Expansion", ring: "ring-green-500/30" },
  target: { color: "#D97706", label: "Future Target", ring: "ring-amber-500/30" },
};

export default function MapPage() {
  const [selected, setSelected] = useState<Region | null>(regions[3]); // default to Columbia

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Market Map — South Carolina Expansion</h1>
      <p className="text-sm text-text-secondary mb-6">
        Current service area and high-potential growth markets for Tile Center Group.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
            <span className="text-xs text-text-secondary">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map SVG */}
        <div className="lg:col-span-2 bg-surface border border-border-custom rounded-lg p-4">
          <svg viewBox="0 0 550 420" className="w-full h-auto">
            {/* SC/GA/NC outline approximation */}
            <path d="M80,120 L200,100 L350,90 L450,100 L480,150 L460,200 L440,250 L420,310 L380,350 L300,360 L220,340 L160,310 L120,280 L80,240 L60,180 Z" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
            {/* State labels */}
            <text x="140" y="380" className="text-[11px]" fill="#94A3B8" fontWeight="500">GEORGIA</text>
            <text x="320" y="80" className="text-[11px]" fill="#94A3B8" fontWeight="500">NORTH CAROLINA</text>
            <text x="320" y="170" className="text-[11px]" fill="#94A3B8" fontWeight="500">SOUTH CAROLINA</text>

            {/* I-85 corridor */}
            <path d="M100,350 L150,300 L230,195 L260,155" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 4" fill="none" />
            <text x="160" y="265" className="text-[8px]" fill="#94A3B8" transform="rotate(-45,160,265)">I-85</text>

            {/* I-77 corridor */}
            <path d="M255,155 L280,200 L310,260" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 4" fill="none" />
            <text x="285" y="210" className="text-[8px]" fill="#94A3B8" transform="rotate(-70,285,210)">I-77</text>

            {/* I-95 corridor */}
            <path d="M370,100 L370,220 L380,310" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 4" fill="none" />
            <text x="375" y="180" className="text-[8px]" fill="#94A3B8">I-95</text>

            {/* Region dots */}
            {regions.map((r) => {
              const cfg = statusConfig[r.status];
              const isSelected = selected?.name === r.name;
              return (
                <g key={r.name} className="cursor-pointer" onClick={() => setSelected(r)}>
                  {/* Pulse ring for expansion */}
                  {r.status === "expansion" && (
                    <circle cx={r.coords.cx} cy={r.coords.cy} r="18" fill="none" stroke={cfg.color} strokeWidth="1.5" opacity="0.3">
                      <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={r.coords.cx} cy={r.coords.cy} r={isSelected ? 12 : 8} fill={cfg.color} opacity={isSelected ? 1 : 0.8} stroke="white" strokeWidth="2" />
                  <text x={r.coords.cx} y={r.coords.cy - 16} textAnchor="middle" className="text-[9px]" fill="#1E293B" fontWeight="600">
                    {r.name.split(",")[0].split("/").pop()?.trim()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              <div className={`bg-surface border rounded-lg p-4 ${statusConfig[selected.status].ring} ring-2`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusConfig[selected.status].color }} />
                  <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: statusConfig[selected.status].color + "15", color: statusConfig[selected.status].color }}>
                  {statusConfig[selected.status].label}
                </span>
                <p className="text-sm text-text-secondary mt-3">{selected.description}</p>
              </div>

              <div className="bg-surface border border-border-custom rounded-lg p-4">
                <h3 className="text-xs font-semibold text-text-secondary uppercase mb-3">Market Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Active Builders" value={String(selected.metrics.builders)} />
                  <Metric label="Metro Population" value={selected.metrics.population} />
                  <Metric label="Construction Growth" value={selected.metrics.constructionGrowth} highlight />
                  <Metric label="Median Home Price" value={selected.metrics.medianHome} />
                </div>
              </div>

              <a
                href="/outreach"
                className="block w-full bg-accent-blue text-white text-sm font-medium px-4 py-2.5 rounded-lg text-center hover:bg-accent-blue/90 transition-colors"
              >
                View Outreach Targets in {selected.name.split(",")[0]}
              </a>
            </>
          ) : (
            <div className="bg-surface border border-border-custom rounded-lg p-6 text-center text-text-secondary">
              Click a market on the map to see details
            </div>
          )}

          {/* Pipeline summary */}
          <div className="bg-surface border border-border-custom rounded-lg p-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase mb-3">Expansion Pipeline</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-text-secondary">Phase 1 — Florence optimization</span><span className="text-accent-blue font-medium">Year 1</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Phase 3 — Columbia (Location 3)</span><span className="text-accent-green font-medium">Year 4</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Future — Charleston</span><span className="text-accent-amber font-medium">Year 5+</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Future — Greenville / Myrtle Beach</span><span className="text-accent-amber font-medium">Year 6+</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-base font-bold ${highlight ? "text-accent-green" : "text-foreground"}`}>{value}</div>
      <div className="text-[10px] text-text-secondary uppercase">{label}</div>
    </div>
  );
}
