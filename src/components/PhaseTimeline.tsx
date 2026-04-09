import { phases } from "@/lib/data";

export function PhaseTimeline() {
  return (
    <div className="space-y-6">
      {/* Phase bar */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        {phases.map((p) => (
          <div
            key={p.number}
            className="flex-1 rounded-full"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      {/* Phase cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <div key={phase.number} className="bg-surface border border-border-custom rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: phase.color }}>
                {phase.number}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{phase.title}</div>
                <div className="text-xs text-text-secondary">{phase.years}</div>
              </div>
            </div>
            <ul className="space-y-2">
              {phase.initiatives.map((init) => (
                <li key={init.name} className="text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground">{init.name}</span>
                    <span className="text-accent-green font-medium">{init.ebitdaImpact}</span>
                  </div>
                  {init.revenueImpact && (
                    <div className="text-text-secondary">{init.revenueImpact} revenue</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex flex-wrap gap-3">
        <span className="bg-accent-green/20 text-accent-green text-xs font-medium px-3 py-1 rounded">
          Total Initiative EBITDA Uplift: +$399K
        </span>
        <span className="bg-accent-blue/20 text-accent-blue text-xs font-medium px-3 py-1 rounded">
          Target Year 5 EBITDA: $877K–$958K+
        </span>
      </div>
    </div>
  );
}
