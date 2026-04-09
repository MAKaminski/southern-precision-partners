import type { Initiative } from "@/lib/data";

const phaseColors: Record<number, string> = {
  1: "bg-accent-blue/20 text-accent-blue",
  2: "bg-accent-green/20 text-accent-green",
  3: "bg-accent-amber/20 text-accent-amber",
};

export function InitiativeCard({ initiative }: { initiative: Initiative }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-foreground">{initiative.name}</h4>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${phaseColors[initiative.phase]}`}>
          Phase {initiative.phase}
        </span>
      </div>
      <p className="text-xs text-text-secondary mb-3">{initiative.description}</p>
      <div className="flex gap-4 text-xs">
        {initiative.revenueImpact && (
          <div>
            <span className="text-text-secondary">Revenue: </span>
            <span className="text-accent-blue font-medium">{initiative.revenueImpact}</span>
          </div>
        )}
        <div>
          <span className="text-text-secondary">EBITDA: </span>
          <span className="text-accent-green font-medium">{initiative.ebitdaImpact}</span>
        </div>
        <div>
          <span className="text-text-secondary">Active: </span>
          <span className="text-foreground">{initiative.firstYear}</span>
        </div>
      </div>
    </div>
  );
}
