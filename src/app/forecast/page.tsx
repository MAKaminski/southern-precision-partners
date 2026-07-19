import { getForecast, sppDbConfigured } from "@/lib/spp-queries";
import { ForecastWorkspace } from "@/components/spp/ForecastWorkspace";

export const dynamic = "force-dynamic";

const money = (v: number) => (v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`);

export default async function ForecastPage() {
  const { rows, debt, revenueMatrix } = await getForecast();
  const configured = sppDbConfigured();

  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  const val = (sc: string, cat: string, yr: number) =>
    rows.find((r) => r.scenario === sc && r.category === cat && r.year === yr)?.value ?? null;
  const latest = years[years.length - 1];
  const salesLatest = val("forecast", "Sales", latest);
  const ebitdaLatest = val("forecast", "EBITDA", latest);
  const ebitdaPctLatest = val("forecast", "EBITDA %", latest);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
          &larr; Project Mosaic
        </a>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Forecast</h1>
        <p className="text-sm text-text-secondary">
          The operating model — Forecast vs Plan across 2022–2031. This is the live source of truth;
          edit any figure in the P&amp;L grid and it persists.
        </p>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>). Once set and the
          Mosaic loader has run, the model appears here.
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-surface border border-border-custom text-text-secondary text-xs rounded-lg p-3">
          No forecast rows loaded yet. Run the Mosaic loader to populate the model.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label={`${latest} Sales (Fcst)`} value={salesLatest ? money(salesLatest) : "—"} />
            <Kpi label={`${latest} EBITDA (Fcst)`} value={ebitdaLatest ? money(ebitdaLatest) : "—"} />
            <Kpi label={`${latest} EBITDA %`} value={ebitdaPctLatest !== null ? `${(ebitdaPctLatest * 100).toFixed(1)}%` : "—"} />
            <Kpi label="Horizon" value={`${years[0]}–${latest}`} />
          </div>
          <ForecastWorkspace rows={rows} years={years} debt={debt} revenueMatrix={revenueMatrix} />
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3 text-center">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
