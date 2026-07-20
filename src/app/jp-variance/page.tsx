import {
  JP_DOC_LABEL,
  financialCompare,
  changesKeithIntroduced,
  perLocationRequirements,
  operationalCoverage,
} from "@/lib/jp-requirements";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-dynamic";

const money = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v).toLocaleString()}`;
const pct = (v: number) => `${v.toFixed(1)}%`;
const signed = (v: number) => (v >= 0 ? `+${money(v)}` : `(${money(Math.abs(v))})`);
const signedPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} pts`;

const IMPACT_STYLE: Record<string, string> = {
  material: "bg-accent-red/10 text-accent-red",
  moderate: "bg-accent-amber/10 text-accent-amber",
  captured: "bg-accent-green/10 text-accent-green",
};

export default function JpVariancePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Project Mosaic
      </a>

      <header className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">JP Requirements — Variance</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          Confirms how Keith&apos;s <strong>{JP_DOC_LABEL}</strong> maps to the platform&apos;s current
          deliverables, and calls out — explicitly, so it can be shared back with Keith — every target and term his
          draft changes versus the model we&apos;re operating from.
        </p>
      </header>

      {/* Bottom line */}
      <section className="bg-surface border border-border-custom rounded-lg p-4 space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Bottom line</h2>
        <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4">
          <li>
            <strong className="text-accent-green">Operational milestones are captured.</strong> Every workstream in
            Keith&apos;s five-year narrative already exists in our Delivery Plan (mapped below) — nothing operational
            is missing.
          </li>
          <li>
            <strong className="text-accent-red">The financials are not.</strong> Keith&apos;s draft raises and
            reshapes the numbers — an 18% Year-1 EBITDA floor, an acquisition-driven growth curve, a 30% JP equity
            stake, a $400K combined comp line, a DSCR covenant, and a fully-specified QSBS exit — none of which is
            in the current model yet. Those are itemized below for his review.
          </li>
        </ul>
      </section>

      {/* Financial trajectory */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">5-Year financial trajectory — our model vs Keith&apos;s draft</h2>
        <div className="overflow-x-auto border border-border-custom rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-surface text-text-secondary">
              <tr className="border-b border-border-custom">
                <th className="text-left py-2 px-3 font-medium">Year</th>
                <th className="text-right py-2 px-2 font-medium">Our Rev</th>
                <th className="text-right py-2 px-2 font-medium">Keith Rev</th>
                <th className="text-right py-2 px-2 font-medium border-l border-border-custom">Our EBITDA</th>
                <th className="text-right py-2 px-2 font-medium">Keith EBITDA</th>
                <th className="text-right py-2 px-2 font-medium">Δ EBITDA</th>
                <th className="text-right py-2 px-2 font-medium border-l border-border-custom">Our Mgn</th>
                <th className="text-right py-2 px-2 font-medium">Keith Mgn</th>
                <th className="text-right py-2 px-3 font-medium">Δ Mgn</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {financialCompare.map((r) => {
                const dEbitda = r.keithEbitda - r.ourEbitda;
                const dMargin = r.keithMargin - r.ourMargin;
                return (
                  <tr key={r.label} className="border-b border-border-custom/50 last:border-0">
                    <td className="py-1.5 px-3 font-sans text-text-secondary">{r.label}</td>
                    <td className="py-1.5 px-2 text-right">{money(r.ourRevenue)}</td>
                    <td className="py-1.5 px-2 text-right">{money(r.keithRevenue)}</td>
                    <td className="py-1.5 px-2 text-right border-l border-border-custom">{money(r.ourEbitda)}</td>
                    <td className="py-1.5 px-2 text-right">{money(r.keithEbitda)}</td>
                    <td className={`py-1.5 px-2 text-right ${dEbitda >= 0 ? "text-accent-green" : "text-accent-red"}`}>{signed(dEbitda)}</td>
                    <td className="py-1.5 px-2 text-right border-l border-border-custom">{pct(r.ourMargin)}</td>
                    <td className="py-1.5 px-2 text-right">{pct(r.keithMargin)}</td>
                    <td className={`py-1.5 px-3 text-right ${dMargin >= 0 ? "text-accent-green" : "text-accent-red"}`}>{signedPct(dMargin)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-text-secondary">
          &ldquo;Our&rdquo; = current model (<code>financialYears</code>, Yr 1 = 2027E … Yr 5 = 2031E). &ldquo;Keith&rdquo; =
          the consolidated summary in his draft. Same total ballpark by Yr 5, but the margin and the path differ.
        </p>
      </section>

      {/* Changes Keith introduced */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Changes Keith introduced</h2>
        <div className="space-y-3">
          {changesKeithIntroduced.map((c) => (
            <div key={c.area} className="border border-border-custom rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                <h3 className="text-xs font-semibold text-foreground">{c.area}</h3>
                <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${IMPACT_STYLE[c.impact]}`}>
                  {c.impact}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-1.5">
                <div className="text-xs">
                  <div className="text-[9px] uppercase tracking-wide text-text-secondary mb-0.5">Our plan</div>
                  <div className="text-text-secondary">{c.ours}</div>
                </div>
                <div className="text-xs">
                  <div className="text-[9px] uppercase tracking-wide text-accent-blue mb-0.5">Keith&apos;s draft</div>
                  <div className="text-foreground">{c.keiths}</div>
                </div>
              </div>
              <p className="text-[11px] text-text-secondary">{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Per-location requirements */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Keith&apos;s per-location requirements (new)</h2>
        <div className="overflow-x-auto border border-border-custom rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-surface text-text-secondary">
              <tr className="border-b border-border-custom">
                <th className="text-left py-2 px-3 font-medium">Location</th>
                <th className="text-right py-2 px-2 font-medium">Yr 1</th>
                <th className="text-right py-2 px-2 font-medium">Yr 2</th>
                <th className="text-right py-2 px-2 font-medium">Yr 3</th>
                <th className="text-right py-2 px-2 font-medium">Yr 4</th>
                <th className="text-right py-2 px-3 font-medium">Yr 5</th>
              </tr>
            </thead>
            <tbody>
              {perLocationRequirements.map((r) => (
                <tr key={r.location} className="border-b border-border-custom/50 last:border-0">
                  <td className="py-1.5 px-3 text-foreground">{r.location}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{r.y1}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{r.y2}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{r.y3}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{r.y4}</td>
                  <td className="py-1.5 px-3 text-right font-mono text-text-secondary">{r.y5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-text-secondary">
          Sales / EBITDA-margin per site. The consolidated model does not break EBITDA out by location, so these
          per-site floors and caps are new requirements to reconcile.
        </p>
      </section>

      {/* Operational coverage */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Operational coverage — already captured in the Delivery Plan
        </h2>
        <div className="overflow-x-auto border border-border-custom rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-surface text-text-secondary">
              <tr className="border-b border-border-custom">
                <th className="text-left py-2 px-3 font-medium w-8">Yr</th>
                <th className="text-left py-2 px-2 font-medium">Keith&apos;s milestone</th>
                <th className="text-left py-2 px-3 font-medium">Captured in Delivery Plan as</th>
              </tr>
            </thead>
            <tbody>
              {operationalCoverage.map((r) => (
                <tr key={r.milestone} className="border-b border-border-custom/50 last:border-0 align-top">
                  <td className="py-1.5 px-3 font-mono text-text-secondary">{r.deliveryYear}</td>
                  <td className="py-1.5 px-2 text-foreground">{r.milestone}</td>
                  <td className="py-1.5 px-3 text-text-secondary">
                    <span className="text-accent-green mr-1">✓</span>
                    {r.capturedAs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-text-secondary">
          <a href="/delivery" className="text-accent-blue hover:underline">Open the Delivery Plan &rarr;</a> to edit
          any of these milestones.
        </p>
      </section>
    </div>
  );
}
