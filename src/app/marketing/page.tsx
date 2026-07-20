import { getForecast, getGrowthInitiatives, sppDbConfigured } from "@/lib/spp-queries";
import { phases } from "@/lib/data";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { GrowthInitiativeStatusSelect } from "@/components/spp/GrowthInitiativeStatusSelect";

export const dynamic = "force-dynamic";

const money = (v: number | null) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

const CATEGORY_LABEL: Record<string, string> = {
  new_business: "New Business",
  churn_replacement: "Churn Replacement",
  share_of_wallet: "Share of Wallet",
  pricing: "Pricing",
  other: "Other",
};

export default async function MarketingPage() {
  const [{ revenueMatrix }, initiatives] = await Promise.all([getForecast(), getGrowthInitiatives()]);
  const configured = sppDbConfigured();

  const revenueGrowthInitiatives = phases
    .flatMap((p) => p.initiatives.map((i) => ({ ...i, phaseTitle: p.title })))
    .filter((i) => i.revenueImpact);

  const latest = revenueMatrix[revenueMatrix.length - 1];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Project Mosaic
      </a>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Marketing &amp; Growth</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          How revenue grows year over year — the mix of existing business, new customers, and churn — plus the
          levers behind it. The revenue build below is modeled; the initiative tracker at the bottom is
          intentionally mostly empty, pending scoping with the marketing &amp; growth lead.
        </p>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>). Once set, the
          revenue build appears here.
        </div>
      ) : (
        <>
          {latest && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Kpi label={`${latest.year} Existing`} value={money(latest.existing_rev)} />
              <Kpi label={`${latest.year} New`} value={money(latest.new_rev)} accent="green" />
              <Kpi label={`${latest.year} Replacement`} value={money(latest.replacement)} />
              <Kpi label={`${latest.year} Churn`} value={money(latest.churn)} accent="red" />
              <Kpi label={`${latest.year} Ending`} value={money(latest.ending_rev)} />
            </div>
          )}

          {/* Revenue build */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">Revenue Build</h2>
            {revenueMatrix.length === 0 ? (
              <p className="text-xs text-text-secondary">No revenue matrix loaded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-border-custom rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-surface">
                    <tr className="border-b border-border-custom text-text-secondary">
                      <th className="text-left py-2 px-3 font-medium">Year</th>
                      <th className="text-right py-2 px-2 font-medium">Existing</th>
                      <th className="text-right py-2 px-2 font-medium">New</th>
                      <th className="text-right py-2 px-2 font-medium">Replacement</th>
                      <th className="text-right py-2 px-2 font-medium">Churn</th>
                      <th className="text-right py-2 px-3 font-medium">Ending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueMatrix.map((r) => (
                      <tr key={r.year} className="border-b border-border-custom/50 last:border-0">
                        <td className="py-1.5 px-3 font-mono text-foreground">{r.year}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(r.existing_rev)}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-accent-green">{money(r.new_rev)}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(r.replacement)}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-accent-red">{money(r.churn)}</td>
                        <td className="py-1.5 px-3 text-right font-mono text-foreground font-semibold">{money(r.ending_rev)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Modeled initiatives with a revenue impact */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">Modeled Revenue-Growth Initiatives</h2>
            <p className="text-[11px] text-text-secondary mb-2">
              From the value-creation plan (read-only here — edit in the underlying model).
            </p>
            <div className="border border-border-custom rounded-lg divide-y divide-border-custom">
              {revenueGrowthInitiatives.map((i) => (
                <div key={i.name} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{i.name}</div>
                    <div className="text-xs text-text-secondary">{i.description}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">
                      {i.phaseTitle} · from {i.firstYear}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-semibold text-accent-green">{i.revenueImpact} rev</div>
                    <div className="text-[10px] font-mono text-text-secondary">{i.ebitdaImpact} EBITDA</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Growth & retention lever tracker */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-2">Growth &amp; Retention Levers</h2>
            <p className="text-[11px] text-text-secondary mb-2">
              How &quot;New&quot; revenue and churn replacement actually get built — share-of-wallet growth,
              pricing, and new customer acquisition are the candidate approaches; which mix to pursue is still
              TBD with the marketing &amp; growth lead.
            </p>
            <div className="overflow-x-auto border border-border-custom rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-surface">
                  <tr className="border-b border-border-custom text-text-secondary">
                    <th className="text-left py-2 px-3 font-medium">Category</th>
                    <th className="text-left py-2 px-2 font-medium">Initiative</th>
                    <th className="text-left py-2 px-2 font-medium">Owner</th>
                    <th className="text-right py-2 px-2 font-medium">Target Impact</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {initiatives.map((i) => (
                    <tr key={i.id} className="border-b border-border-custom/50 last:border-0 align-top">
                      <td className="py-2 px-3 text-text-secondary whitespace-nowrap">
                        {CATEGORY_LABEL[i.category]}
                      </td>
                      <td className="py-2 px-2">
                        <div className="text-foreground font-medium">{i.name}</div>
                        {i.description && <div className="text-[10px] text-text-secondary mt-0.5">{i.description}</div>}
                      </td>
                      <td className="py-2 px-2 text-text-secondary">{i.owner ?? "—"}</td>
                      <td className="py-2 px-2 text-right font-mono text-text-secondary">
                        {money(i.target_revenue_impact)}
                      </td>
                      <td className="py-2 px-3">
                        <GrowthInitiativeStatusSelect id={i.id} initial={i.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "green" | "red" }) {
  const color = accent === "green" ? "text-accent-green" : accent === "red" ? "text-accent-red" : "text-foreground";
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
