import { fullScenarios } from "@/lib/data";

const scenarioColors: Record<string, string> = {
  Bear: "border-red-500/30",
  Base: "border-accent-blue/30",
  Bull: "border-accent-green/30",
  Stretch: "border-accent-amber/30",
};

export function FullScenarioCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fullScenarios.map((s) => (
        <div key={s.name} className={`bg-surface border ${scenarioColors[s.name]} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">{s.name} Case</h4>
            <span className="text-xs text-text-secondary">Exit: {s.exitMultiple}</span>
          </div>
          <div className="space-y-3">
            <InvestorRow label="LP (Pete — Debt)" invested="$2.4M" data={s.lp} color="text-accent-blue" />
            <InvestorRow label="GP — Keith Piper (75% profit)" invested="$400K" data={s.mp} color="text-accent-green" />
            <InvestorRow label="JP (5% equity + 15% carry)" invested="$100K" data={s.jp} color="text-accent-purple" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InvestorRow({
  label,
  invested,
  data,
  color,
}: {
  label: string;
  invested: string;
  data: { proceeds: string; moic: string; irr: string };
  color: string;
}) {
  return (
    <div className="border-b border-border-custom/30 pb-2 last:border-0 last:pb-0">
      <div className={`text-xs font-medium ${color} mb-1`}>{label} ({invested})</div>
      <div className="flex gap-4 text-xs">
        <span className="text-text-secondary">
          Proceeds: <span className="text-foreground">{data.proceeds}</span>
        </span>
        <span className="text-text-secondary">
          MOIC: <span className="text-accent-green font-semibold">{data.moic}</span>
        </span>
        <span className="text-text-secondary">
          IRR: <span className="text-accent-green font-semibold">{data.irr}</span>
        </span>
      </div>
    </div>
  );
}
