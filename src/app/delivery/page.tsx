import { getDeliveryTasks, sppDbConfigured, type DeliveryTask } from "@/lib/spp-queries";
import { DeliveryStatusSelect } from "@/components/spp/DeliveryStatusSelect";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-dynamic";

const SYSTEM_COLORS: Record<string, string> = {
  CRM: "bg-accent-blue/10 text-accent-blue",
  ERP: "bg-accent-purple/10 text-accent-purple",
  ERD: "bg-accent-purple/10 text-accent-purple",
  HRIS: "bg-accent-green/10 text-accent-green",
  Bank: "bg-accent-green/10 text-accent-green",
  GL: "bg-accent-green/10 text-accent-green",
  Finance: "bg-accent-green/10 text-accent-green",
  POS: "bg-accent-blue/10 text-accent-blue",
  Web: "bg-accent-blue/10 text-accent-blue",
  People: "bg-accent-amber/10 text-accent-amber",
  Process: "bg-accent-amber/10 text-accent-amber",
  Marketing: "bg-accent-amber/10 text-accent-amber",
  Facility: "bg-text-secondary/10 text-text-secondary",
  "Customer Portal": "bg-accent-blue/10 text-accent-blue",
};

const YEAR_LABEL: Record<number, string> = {
  1: "Year 1 — Integration & Foundation (2026)",
  2: "Year 2 — Revenue Acceleration (2027)",
  3: "Year 3 — Scale & Expansion (2028)",
  4: "Year 4 — Platform & Portals (2029)",
  5: "Year 5 — Optimize & Exit (2030–31)",
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y.slice(2)}`;
}
function k(v: number | null): string {
  return v === null || v === undefined ? "—" : `$${v.toLocaleString()}K`;
}

export default async function DeliveryPlanPage() {
  const tasks = await getDeliveryTasks();
  const configured = sppDbConfigured();

  const totalCost = tasks.reduce((s, t) => s + (Number(t.cost_k) || 0), 0);
  const totalBenefit = tasks.reduce((s, t) => s + (Number(t.benefit_k) || 0), 0);
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;

  const years = [...new Set(tasks.map((t) => t.delivery_year ?? 0))].sort((a, b) => a - b);
  const byYear = (yr: number) => tasks.filter((t) => (t.delivery_year ?? 0) === yr);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
          &larr; Project Mosaic
        </a>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Delivery Plan</h1>
              <ClassificationBadge level="confidential" showAudience={false} />
            </div>
            <p className="text-sm text-text-secondary">
              The real execution roadmap — 40 initiatives across a 5-year hold. Update status inline as work progresses.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="Tasks" value={String(tasks.length)} />
            <Stat label="In Progress" value={String(inProgress)} />
            <Stat label="Done" value={String(doneCount)} />
            <Stat label="Complete" value={tasks.length ? `${Math.round((doneCount / tasks.length) * 100)}%` : "—"} />
          </div>
        </div>
      </header>

      {!configured && (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>). Once set and the
          Mosaic loader has run, the plan appears here.
        </div>
      )}

      {years.map((yr) => {
        const rows = byYear(yr);
        const yc = rows.reduce((s, t) => s + (Number(t.cost_k) || 0), 0);
        const yb = rows.reduce((s, t) => s + (Number(t.benefit_k) || 0), 0);
        const yDone = rows.filter((t) => t.status === "done").length;
        return (
          <section key={yr}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">{YEAR_LABEL[yr] ?? `Year ${yr}`}</h2>
              <span className="text-[11px] text-text-secondary">
                {rows.length} tasks · {yDone} done · Cost {k(yc)} · Benefit {k(yb)}
              </span>
            </div>
            {/* progress bar */}
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden mb-3 border border-border-custom">
              <div className="h-full bg-accent-green" style={{ width: rows.length ? `${(yDone / rows.length) * 100}%` : "0%" }} />
            </div>
            <div className="overflow-x-auto border border-border-custom rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-custom bg-surface text-text-secondary">
                    <th className="text-left py-2 px-3 font-medium">Initiative</th>
                    <th className="text-left py-2 px-2 font-medium">System</th>
                    <th className="text-left py-2 px-2 font-medium">Next Step</th>
                    <th className="text-center py-2 px-2 font-medium">Owner</th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap">Start</th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap">End</th>
                    <th className="text-right py-2 px-2 font-medium">Cost</th>
                    <th className="text-right py-2 px-2 font-medium">Benefit</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t: DeliveryTask) => (
                    <tr key={t.id} className="border-b border-border-custom/50 hover:bg-surface/50">
                      <td className="py-2 px-3 text-foreground font-medium max-w-[220px]">{t.title}</td>
                      <td className="py-2 px-2">
                        {t.system ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${SYSTEM_COLORS[t.system] ?? "bg-surface text-text-secondary"}`}>
                            {t.system}
                          </span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-text-secondary max-w-[200px] truncate" title={t.next_step ?? ""}>
                        {t.next_step ?? "—"}
                      </td>
                      <td className="py-2 px-2 text-center text-text-secondary">{t.owner ?? "—"}</td>
                      <td className="py-2 px-2 text-right text-text-secondary whitespace-nowrap font-mono">{fmtDate(t.start_date)}</td>
                      <td className="py-2 px-2 text-right text-text-secondary whitespace-nowrap font-mono">{fmtDate(t.end_date)}</td>
                      <td className="py-2 px-2 text-right font-mono text-text-secondary">{k(t.cost_k)}</td>
                      <td className="py-2 px-2 text-right font-mono text-accent-green">{t.benefit_k ? k(t.benefit_k) : "—"}</td>
                      <td className="py-2 px-3">
                        <DeliveryStatusSelect id={t.id} initial={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {tasks.length > 0 && (
        <div className="flex justify-end gap-6 text-xs text-text-secondary border-t border-border-custom pt-4">
          <span>Total Cost: <b className="text-foreground font-mono">{k(totalCost)}</b></span>
          <span>Total Benefit: <b className="text-accent-green font-mono">{k(totalBenefit)}</b></span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg px-3 py-1.5 min-w-[64px]">
      <div className="text-base font-bold text-foreground leading-tight">{value}</div>
      <div className="text-[9px] text-text-secondary uppercase tracking-wide">{label}</div>
    </div>
  );
}
