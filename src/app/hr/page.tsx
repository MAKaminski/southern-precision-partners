import { getEmployees, sppDbConfigured } from "@/lib/spp-queries";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { HrRoster } from "@/components/spp/HrRoster";

export const dynamic = "force-dynamic";

export default async function HrPage() {
  const employees = await getEmployees();
  const configured = sppDbConfigured();

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
          role/status/pay snapshot. Click any role, status, or pay cell to edit — changes save to Supabase
          immediately. Use &quot;+ Add&quot; to plan a role for someone who doesn&apos;t have one yet, or
          &quot;+ Add Employee&quot; for a new hire.
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
        <HrRoster initial={employees} />
      )}
    </div>
  );
}
