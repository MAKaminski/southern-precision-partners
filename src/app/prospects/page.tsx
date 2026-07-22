import { ClassificationBadge } from "@/components/ClassificationBadge";
import { SourceTag } from "@/components/SourceTag";
import { ProspectsExplorer } from "@/components/spp/ProspectsExplorer";
import { getProspects, sppDbConfigured } from "@/lib/spp-queries";
import { landbaseScProspects } from "@/lib/sources";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const configured = sppDbConfigured();
  const prospects = configured ? await getProspects() : [];

  const totalContacts = prospects.reduce((n, p) => n + p.contacts.length, 0);
  const aTier = prospects.filter((p) => p.fit_score >= 80).length;
  const candidates = prospects.filter((p) => p.matched_customer_id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pro Prospects — SC Expansion</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          Construction and remodeling companies across South Carolina — the Pro buyer for the tile-system expansion —
          with their named decision-makers, ranked by a transparent fit score. Filter by territory, fit tier, or
          reachability, and expand any row for firmographics and contacts.
        </p>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <SourceTag sourceId={landbaseScProspects.id} />
          <a href="/reports" className="text-[11px] text-accent-blue hover:underline">Reports appendix →</a>
          <a href="/changelog" className="text-[11px] text-accent-blue hover:underline">Changelog →</a>
        </div>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4 text-sm text-accent-amber">
          Database connection not configured — set the Supabase service-role key to load the prospect pipeline.
        </div>
      ) : prospects.length === 0 ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4 text-sm text-accent-amber">
          No prospects loaded yet. Apply migrations <code>0014_prospects_schema</code> and{" "}
          <code>0015_seed_prospects</code> to the Supabase project to populate this pipeline (213 companies / 369
          contacts).
        </div>
      ) : (
        <>
          {/* KPIs */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Companies", value: prospects.length, cls: "text-foreground" },
              { label: "Decision-makers", value: totalContacts, cls: "text-foreground" },
              { label: "A-tier (fit 80+)", value: aTier, cls: "text-accent-green" },
              { label: "Enrichment candidates", value: candidates.length, cls: "text-accent-amber" },
            ].map((s) => (
              <div key={s.label} className="border border-border-custom rounded-lg p-3 bg-surface">
                <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wide text-text-secondary mt-0.5">{s.label}</div>
              </div>
            ))}
          </section>

          {/* Enrichment-candidates callout (non-destructive) */}
          {candidates.length > 0 && (
            <section className="bg-surface border border-border-custom rounded-lg p-4 space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                {candidates.length} prospects look like existing customers — enrichment candidates
              </h2>
              <p className="text-xs text-text-secondary">
                These matched an existing customer record by name. Their firmographics and named contacts can enrich
                that customer, but <strong>nothing is written to customer records automatically</strong> — customer
                names in the current data are truncated (~14 chars), so matches are prefix-based and want a human check.
                Toggle &ldquo;Enrichment candidates only&rdquo; below to review them.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {candidates.slice(0, 20).map((c) => (
                  <span key={c.id} className="inline-flex items-center rounded border border-border-custom bg-background px-2 py-0.5 text-[10px] text-text-secondary" title={`Matches customer "${c.matched_customer?.name ?? ""}" (${c.match_confidence})`}>
                    {c.name}
                    <span className="ml-1 text-accent-amber">→ {c.matched_customer?.name ?? "customer"}</span>
                  </span>
                ))}
                {candidates.length > 20 && (
                  <span className="text-[10px] text-text-secondary self-center">+{candidates.length - 20} more</span>
                )}
              </div>
            </section>
          )}

          {/* Fit-score note */}
          <p className="text-[11px] text-text-secondary">
            <strong>Fit score</strong> is a transparent in-house heuristic (revenue band + tile/remodel keyword fit +
            decision-maker seniority + reachability), not vendor-supplied — the export&apos;s own Fit/Relevance columns
            came back empty. It&apos;s a prioritization aid, not a guarantee.
          </p>

          <ProspectsExplorer prospects={prospects} />
        </>
      )}
    </div>
  );
}
