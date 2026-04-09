import { KPICard } from "@/components/KPICard";
import { CapStackBar } from "@/components/CapStackBar";
import { InvestorReturnCard } from "@/components/InvestorReturnCard";
import { ReturnScenarioTable } from "@/components/ReturnScenarioTable";
import { PhaseTimeline } from "@/components/PhaseTimeline";
import { kpiStats, investorReturns, keyRisks, contactInfo, usesOfFunds } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function MosaicSummaryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <header className="text-center space-y-3">
        <a href="/" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
          &larr; Southeast Precision Partners
        </a>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Project Mosaic</h1>
        <p className="text-sm text-text-secondary">
          Tile Center Group — Leveraged Buyout | April 2026 | Confidential
        </p>
        <span className="inline-block bg-accent-amber/10 text-accent-amber text-xs font-medium px-3 py-1 rounded">
          For discussion purposes only
        </span>
      </header>

      {/* Section 1: The Business */}
      <section>
        <SectionHeader title="The Business" anchor="business" />
        <p className="text-sm text-text-secondary mb-4 max-w-3xl">
          Tile Center Group is an established tile and stone distributor in Georgia with ~$5M in annual revenue
          and 11% EBITDA margins. The business is profitable, asset-light, and has 3 years of audited history.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiStats.map((stat) => (
            <KPICard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      {/* Section 2: Deal Structure */}
      <section>
        <SectionHeader title="The Deal Structure" anchor="deal-structure" />
        <div className="bg-surface border border-border-custom rounded-lg p-5">
          <CapStackBar />
          <div className="mt-4 border-t border-border-custom pt-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase mb-2">Uses of Funds</h4>
            <div className="flex flex-wrap gap-3">
              {usesOfFunds.map((u) => (
                <span key={u.label} className="text-xs text-text-secondary">
                  {u.label}: <span className="text-foreground font-medium">{formatCurrency(u.amount, true)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Returns at a Glance */}
      <section>
        <SectionHeader title="Returns at a Glance" anchor="returns" />
        <p className="text-xs text-text-secondary mb-4">Base case = 5-year hold, $9M exit EV</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {investorReturns.map((inv) => (
            <InvestorReturnCard key={inv.title} investor={inv} />
          ))}
        </div>
        <div className="bg-surface border border-border-custom rounded-lg p-4">
          <h4 className="text-xs font-semibold text-text-secondary uppercase mb-3">
            Junior Partner Scenario Analysis
          </h4>
          <ReturnScenarioTable />
        </div>
      </section>

      {/* Section 4: Value Creation */}
      <section>
        <SectionHeader title="Value Creation" anchor="value-creation" />
        <PhaseTimeline />
      </section>

      {/* Section 5: Key Risks */}
      <section>
        <SectionHeader title="Key Risks" anchor="risks" />
        <ul className="space-y-2">
          {keyRisks.map((risk, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent-amber mt-0.5">•</span>
              {risk}
            </li>
          ))}
        </ul>
        <a href="/details#returns" className="text-xs text-accent-blue hover:text-accent-blue/80 mt-3 inline-block">
          → Full risk analysis on details page
        </a>
      </section>

      {/* Section 6: CTA Footer */}
      <section className="bg-surface border border-border-custom rounded-lg p-6 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <a
            href="/api/download-model"
            download="Project_Mosaic_LBO_Model.xlsx"
            className="inline-flex items-center justify-center bg-accent-blue text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Download LBO Model
          </a>
          <a
            href={`mailto:${contactInfo.email}?subject=Project%20Mosaic%20-%20Data%20Room%20Request`}
            className="inline-flex items-center justify-center bg-surface border border-border-custom text-foreground text-sm font-medium px-5 py-2 rounded-lg hover:bg-border-custom/50 transition-colors"
          >
            Request Data Room Access
          </a>
        </div>
        <p className="text-xs text-text-secondary">
          {contactInfo.name} | {contactInfo.title} | {contactInfo.company} |{" "}
          <a href={`mailto:${contactInfo.email}`} className="text-accent-blue hover:underline">
            {contactInfo.email}
          </a>
        </p>
      </section>
    </div>
  );
}

function SectionHeader({ title, anchor }: { title: string; anchor: string }) {
  return (
    <div className="flex items-center justify-between mb-4" id={anchor}>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <a href={`/details#${anchor}`} className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
        → See full details
      </a>
    </div>
  );
}
