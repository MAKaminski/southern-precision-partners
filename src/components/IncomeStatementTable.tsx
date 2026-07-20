import { cashFlowProjections, ebitdaBridgeNormalization } from "@/lib/data";

function fmt(val: number | null): string {
  if (val === null) return "—";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
}

export function IncomeStatementTable() {
  return (
    <div>
      {/* EBITDA Bridge Summary */}
      <div className="mb-6 bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-accent-blue uppercase mb-2">EBITDA Normalization Bridge</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="text-text-secondary">Baseline (CIM): <b className="text-foreground">${(ebitdaBridgeNormalization.baselineEbitda / 1000).toFixed(0)}K</b></span>
          <span className="text-text-secondary">→ + Rent Reclamation <b className="text-accent-green">+$90K</b></span>
          <span className="text-text-secondary">→ + Florence Optimization <b className="text-accent-green">+$28K</b></span>
          <span className="text-text-secondary">= Normalized Day 1: <b className="text-foreground">${(ebitdaBridgeNormalization.normalizedDay1 / 1000).toFixed(0)}K</b></span>
          <span className="text-text-secondary">→ + SCF Float <b className="text-accent-green">+$56.8K</b></span>
          <span className="text-text-secondary">→ + COGS Reduction <b className="text-accent-green">+$45.2K</b></span>
          <span className="text-text-secondary">= Year 1 Pro-Forma: <b className="text-foreground">${(ebitdaBridgeNormalization.year1ProForma / 1000).toFixed(0)}K</b></span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-4">Cash Flow Projections</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-custom">
              <th className="text-left py-2 px-2 text-text-secondary font-medium">Line Item</th>
              {cashFlowProjections.map((f) => (
                <th key={f.year} className="text-right py-2 px-2 text-text-secondary font-medium">{f.year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Sales" values={cashFlowProjections.map((f) => f.sales)} isHeader />
            <Row label="EBITDA" values={cashFlowProjections.map((f) => f.ebitda)} isHeader />
            <Row label="EBITDA %" values={cashFlowProjections.map((f) => f.ebitdaPct)} isPct />
            <Row label="SBA Interest (10%)" values={cashFlowProjections.map((f) => f.sbaInterest)} />
            <Row label="SBA Principal" values={cashFlowProjections.map((f) => f.sbaPrincipal)} />
            <Row label="Seller Note Interest (10%)" values={cashFlowProjections.map((f) => f.sellerNoteInterest)} />
            <Row label="Seller Note Principal" values={cashFlowProjections.map((f) => f.sellerNotePrincipal)} />
            <Row label="Capex" values={cashFlowProjections.map((f) => f.capex)} />
            <Row label="Est. Taxes" values={cashFlowProjections.map((f) => f.taxes)} />
            <Row label="Net Income" values={cashFlowProjections.map((f) => f.netIncome)} isHeader />
            <Row label="Free Cash Flow" values={cashFlowProjections.map((f) => f.freeCashFlow)} isHeader />
            <Row label="Distributable Pool (min ⅓ NI, FCF)" values={cashFlowProjections.map((f) => f.distributablePool)} isHeader highlight />
            <tr><td colSpan={6} className="py-2 px-2 text-[10px] text-text-secondary font-semibold uppercase">Annual Distributions</td></tr>
            <Row label="→ GP (Keith Piper)" values={cashFlowProjections.map((f) => f.gpDistribution)} />
            <Row label="→ JP (vested equity %)" values={cashFlowProjections.map((f) => f.jpDistribution)} />
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-text-secondary mt-2">
        Capital structure: SBA Term Loan (Live Oak Bank) $2.24M @ 10%/15-yr + Seller Note $280K @ 10%.
        Distribution rule: each year, distribute the lesser of ⅓ Net Income or Free Cash Flow; JP receives
        that pool × their vested equity % for the year (4% → 20% over the hold); GP receives the remainder.
      </p>
    </div>
  );
}

function Row({ label, values, isHeader, isPct, highlight }: { label: string; values: number[]; isHeader?: boolean; isPct?: boolean; highlight?: boolean }) {
  return (
    <tr className={`border-b border-border-custom/50 ${isHeader ? "bg-surface" : ""}`}>
      <td className={`py-1.5 px-2 ${isHeader ? "font-semibold text-foreground" : "text-text-secondary"}`}>{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`py-1.5 px-2 text-right font-mono ${
            isHeader ? "font-semibold text-foreground" : "text-text-secondary"
          } ${v < 0 ? "text-red-600/80" : ""} ${highlight ? "text-accent-green font-semibold" : ""}`}
        >
          {isPct ? `${v.toFixed(1)}%` : fmt(v)}
        </td>
      ))}
    </tr>
  );
}
