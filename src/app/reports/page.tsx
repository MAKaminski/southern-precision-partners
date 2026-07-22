import { ClassificationBadge } from "@/components/ClassificationBadge";
import { SourceTag } from "@/components/SourceTag";
import {
  reportsByCategory,
  reportCounts,
  REPORT_STATUS_META,
  type Report,
} from "@/lib/reports";
import { keithBiInput } from "@/lib/sources";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: Report["status"] }) {
  const meta = REPORT_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
      title={meta.blurb}
    >
      {meta.label}
    </span>
  );
}

function ReportCard({ r }: { r: Report }) {
  return (
    <div className="border border-border-custom rounded-lg p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
        <StatusBadge status={r.status} />
      </div>

      <p className="text-xs text-text-secondary">
        <span className="text-[9px] uppercase tracking-wide text-accent-blue mr-1.5">Q</span>
        {r.question}
      </p>

      <p className="text-xs text-foreground/90 leading-relaxed">{r.definition}</p>

      <dl className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-[11px]">
        <dt className="text-text-secondary uppercase tracking-wide text-[9px] pt-0.5">Grain</dt>
        <dd className="text-text-secondary font-mono">{r.grain}</dd>

        <dt className="text-text-secondary uppercase tracking-wide text-[9px] pt-0.5">Data source</dt>
        <dd className="text-text-secondary">{r.dataSource}</dd>

        {r.servedBy && (
          <>
            <dt className="text-text-secondary uppercase tracking-wide text-[9px] pt-0.5">Served by</dt>
            <dd className="text-text-secondary font-mono">{r.servedBy}</dd>
          </>
        )}

        {r.gap && (
          <>
            <dt className="text-accent-amber uppercase tracking-wide text-[9px] pt-0.5">Gap</dt>
            <dd className="text-text-secondary">{r.gap}</dd>
          </>
        )}
      </dl>

      <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
        {r.sourceId ? (
          <SourceTag sourceId={r.sourceId} excerpt={r.sourceExcerpt} />
        ) : (
          <span className="text-[10px] text-text-secondary/70 italic">Pre-existing platform view</span>
        )}
        {r.liveRoute && (
          <a href={r.liveRoute} className="text-[11px] text-accent-blue hover:underline whitespace-nowrap">
            Open {r.liveRoute} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const groups = reportsByCategory();
  const counts = reportCounts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reports</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          An appendix of the analytics views we look at — the live views already in the platform, plus the BI
          reports requested for the KPI dashboards. Each entry states the question it answers, how it&apos;s computed,
          its data source, and — where it isn&apos;t live yet — exactly what data it needs.
        </p>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <SourceTag sourceId={keithBiInput.id} />
          <a href="/changelog" className="text-[11px] text-accent-blue hover:underline">
            See the Changelog &rarr;
          </a>
        </div>
      </header>

      {/* Counts */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Reports", value: counts.total, cls: "text-foreground" },
          { label: "Live", value: counts.live, cls: "text-accent-green" },
          { label: "Spec — data pending", value: counts.spec, cls: "text-accent-amber" },
          { label: "Planned", value: counts.planned, cls: "text-accent-blue" },
        ].map((s) => (
          <div key={s.label} className="border border-border-custom rounded-lg p-3 bg-surface">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-text-secondary mt-0.5">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Data-honesty note */}
      <section className="bg-surface border border-border-custom rounded-lg p-4 space-y-1.5">
        <h2 className="text-sm font-semibold text-foreground">Why several reports read &ldquo;Spec — data pending&rdquo;</h2>
        <p className="text-xs text-text-secondary">
          The database holds summary-level figures only (annual sales per customer, an AR ledger, and monthly/annual
          P&amp;L aggregates). There is <strong>no line-level sales, product/SKU, salesperson, or discount data</strong>{" "}
          captured yet — so mix rate, attachment %, per-associate KPIs, and discount visibility are defined here in
          full but cannot compute until that source data lands. Each spec names the layered{" "}
          <code className="text-[10px]">core.fact_*</code> / <code className="text-[10px]">serving.*</code> object that
          will serve it once ETL is built (see the ERD and data-architecture doc). Nothing here is back-filled with
          invented numbers.
        </p>
      </section>

      {/* Reports by category */}
      {groups.map((g) => (
        <section key={g.category} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground border-b border-border-custom pb-1.5">
            {g.category}
            <span className="ml-2 text-[10px] font-normal text-text-secondary">{g.reports.length}</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {g.reports.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
