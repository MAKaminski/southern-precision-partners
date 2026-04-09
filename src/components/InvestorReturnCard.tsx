import type { InvestorReturn } from "@/lib/data";

interface InvestorReturnCardProps {
  investor: InvestorReturn;
}

export function InvestorReturnCard({ investor }: InvestorReturnCardProps) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: investor.color }} />
        <h3 className="text-sm font-semibold text-foreground">{investor.title}</h3>
      </div>
      <div className="space-y-2">
        <Row label="Cash Invested" value={investor.invested} />
        <Row label="Structure" value={investor.structure} />
        <Row label="Total Proceeds (Base)" value={investor.proceeds} />
        <Row label="MOIC" value={investor.moic} highlight />
        <Row label="IRR" value={investor.irr} highlight />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className={highlight ? "text-accent-green font-semibold" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}
