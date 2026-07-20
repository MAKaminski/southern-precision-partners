import { getEmployees, sppDbConfigured } from "@/lib/spp-queries";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-dynamic";

const money = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

const payDisplay = (payType: string, rate: number, hours: number | null) =>
  payType === "hourly" ? `$${rate.toLocaleString()}/hr${hours ? ` (${hours} hrs/wk)` : ""}` : `${money(rate)}/yr`;

const statusBadge: Record<string, string> = {
  active: "bg-accent-green/10 text-accent-green",
  new_hire: "bg-accent-blue/10 text-accent-blue",
  terminated: "bg-accent-red/10 text-accent-red",
};

export default async function HrPage() {
  const employees = await getEmployees();
  const configured = sppDbConfigured();

  const currentActive = employees.filter((e) => e.plans.current?.status === "active");
  const postTransitionPlanned = employees.some((e) => e.plans.post_transition);
  const postActive = employees.filter(
    (e) => e.plans.post_transition && e.plans.post_transition.status !== "terminated"
  );
  const currentCost = currentActive.reduce((s, e) => s + (Number(e.plans.current?.annualized_cost) || 0), 0);
  const postCost = postActive.reduce((s, e) => s + (Number(e.plans.post_transition?.annualized_cost) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Project Mosaic
      </a>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">HR &amp; Payroll</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          Current roster and the post-transition staffing plan, side by side — one row per person, each with a{" "}
          <code className="text-[11px] bg-surface border border-border-custom rounded px-1 py-0.5">current</code>{" "}
          and a{" "}
          <code className="text-[11px] bg-surface border border-border-custom rounded px-1 py-0.5">
            post_transition
          </code>{" "}
          role/status/pay snapshot.
        </p>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>). Once set, the
          staffing plan appears here.
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-sm rounded-lg p-4 space-y-2">
          <p className="font-medium">No employees loaded yet.</p>
          <p className="text-xs">
            The schema (<code>hr_employees</code> / <code>hr_employee_plan_details</code>) is live and ready, but
            no employee data exists in this repo, the Mosaic workbook loaders, or Supabase — this needs the actual
            census: for each of the 13 current employees, name, role/title, department, pay type (hourly/salary)
            and rate, employment type; and for the post-transition plan, who stays (at what rate/role if changed),
            who&apos;s terminated, and who&apos;s newly hired. Send that over and it&apos;ll be loaded here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Current Headcount" value={String(currentActive.length)} />
            <Kpi
              label="Post-Transition Headcount"
              value={postTransitionPlanned ? String(postActive.length) : "Not yet planned"}
            />
            <Kpi label="Current Annualized Payroll" value={money(currentCost)} />
            <Kpi
              label="Post-Transition Annualized Payroll"
              value={postTransitionPlanned ? money(postCost) : "Not yet planned"}
              accent={postTransitionPlanned && postCost !== currentCost}
            />
          </div>

          <div className="overflow-x-auto border border-border-custom rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-surface">
                <tr className="border-b border-border-custom text-text-secondary">
                  <th className="text-left py-2 px-3 font-medium">Name</th>
                  <th className="text-left py-2 px-2 font-medium" colSpan={3}>
                    Current
                  </th>
                  <th className="text-left py-2 px-2 font-medium" colSpan={3}>
                    Post-Transition
                  </th>
                  <th className="text-left py-2 px-3 font-medium">Change</th>
                </tr>
                <tr className="border-b border-border-custom text-text-secondary">
                  <th className="text-left py-1 px-3 font-normal"></th>
                  <th className="text-left py-1 px-2 font-normal">Role</th>
                  <th className="text-left py-1 px-2 font-normal">Status</th>
                  <th className="text-right py-1 px-2 font-normal">Pay</th>
                  <th className="text-left py-1 px-2 font-normal">Role</th>
                  <th className="text-left py-1 px-2 font-normal">Status</th>
                  <th className="text-right py-1 px-2 font-normal">Pay</th>
                  <th className="text-left py-1 px-3 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => {
                  const cur = e.plans.current;
                  const post = e.plans.post_transition;
                  return (
                    <tr key={e.id} className="border-b border-border-custom/50 last:border-0">
                      <td className="py-1.5 px-3 font-mono text-foreground whitespace-nowrap">{e.full_name}</td>
                      <td className="py-1.5 px-2 text-text-secondary">{cur?.role_title ?? "—"}</td>
                      <td className="py-1.5 px-2">
                        {cur && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusBadge[cur.status]}`}
                          >
                            {cur.status}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-text-secondary whitespace-nowrap">
                        {cur ? payDisplay(cur.pay_type, cur.pay_rate, cur.hours_per_week) : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-text-secondary">{post?.role_title ?? "—"}</td>
                      <td className="py-1.5 px-2">
                        {post && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusBadge[post.status]}`}
                          >
                            {post.status}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-text-secondary whitespace-nowrap">
                        {post ? payDisplay(post.pay_type, post.pay_rate, post.hours_per_week) : "—"}
                      </td>
                      <td className="py-1.5 px-3 text-text-secondary">{post?.change_type ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3 text-center">
      <div className={`text-xl font-bold ${accent ? "text-accent-amber" : "text-foreground"}`}>{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
