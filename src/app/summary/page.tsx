import { getForecast, getMonthlyPerformance, sppDbConfigured } from "@/lib/spp-queries";
import { MonthlySummaryGrid } from "@/components/spp/MonthlySummaryGrid";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-dynamic";
const YEAR = 2026;

const money = (v: number | null) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

export default async function SummaryPage() {
  const [{ rows: forecastRows }, monthly] = await Promise.all([getForecast(), getMonthlyPerformance(YEAR)]);
  const configured = sppDbConfigured();

  const planSales = forecastRows.find((r) => r.scenario === "plan" && r.category === "Sales" && r.year === YEAR)?.value ?? null;
  const planEbitda = forecastRows.find((r) => r.scenario === "plan" && r.category === "EBITDA" && r.year === YEAR)?.value ?? null;

  const monthsWithActuals = new Set(monthly.filter((r) => r.actual_value !== null).map((r) => r.month)).size;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Project Mosaic
      </a>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Summary</h1>
          <ClassificationBadge level="confidential" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          High-level cashflow and performance vs plan, updated monthly as each period closes. This is the basic
          investor update — Revenue, EBITDA, Free Cash Flow, and Cash Balance, plan vs actual.
        </p>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>). Once set, this
          page appears here.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Kpi label={`${YEAR} Annual Plan — Sales`} value={money(planSales)} />
            <Kpi label={`${YEAR} Annual Plan — EBITDA`} value={money(planEbitda)} />
            <Kpi label="Months with Actuals Entered" value={`${monthsWithActuals} / 12`} />
          </div>
          <p className="text-[10px] text-text-secondary -mt-3">
            Monthly <strong>Plan</strong> is the full-year {YEAR} Plan phased evenly across the year (the operating
            model runs revenue at a flat ~$390K/mo). <strong>Actual</strong> is set equal to Plan for the closed
            months (Jan&ndash;Sep {YEAR}) as a tracking-to-plan placeholder, to be replaced as real monthly closes
            are booked; Oct&ndash;Dec actuals and the Free Cash Flow / Cash Balance rows are left blank pending
            close data. Click any cell to enter a booked figure.
          </p>

          {monthly.length === 0 ? (
            <div className="bg-surface border border-border-custom text-text-secondary text-xs rounded-lg p-3">
              No monthly grid for {YEAR} yet.
            </div>
          ) : (
            <MonthlySummaryGrid rows={monthly} />
          )}
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
