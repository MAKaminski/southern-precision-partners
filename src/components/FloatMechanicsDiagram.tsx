import { floatSteps } from "@/lib/data";

export function FloatMechanicsDiagram() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">90-Day Float Mechanics</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[52px] top-0 bottom-0 w-px bg-accent-blue/30" />

        <div className="space-y-4">
          {floatSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-[52px] shrink-0 text-right">
                <span className="text-xs font-mono font-bold text-accent-blue">{step.day}</span>
              </div>
              <div className="relative">
                <div className="absolute -left-[8px] top-1.5 w-3 h-3 rounded-full bg-accent-blue border-2 border-background" />
                <p className="text-sm text-foreground pl-3">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 bg-surface border border-border-custom rounded-lg p-3">
        <p className="text-xs text-text-secondary">
          <span className="text-accent-green font-medium">Net:</span> $500 fee on $50K = 1% transaction cost; ~$700K working capital freed
        </p>
      </div>
    </div>
  );
}
