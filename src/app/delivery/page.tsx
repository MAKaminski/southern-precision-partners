import Link from "next/link";
import { getDeliveryTasks, sppDbConfigured } from "@/lib/spp-queries";
import { DeliveryPlanTable } from "@/components/spp/DeliveryPlanTable";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-dynamic";

export default async function DeliveryPlanPage() {
  const tasks = await getDeliveryTasks();
  const configured = sppDbConfigured();

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <Link href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
          &larr; Project Mosaic
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Delivery Plan</h1>
              <ClassificationBadge level="internal" showAudience={false} />
            </div>
            <p className="text-sm text-text-secondary">
              The real execution roadmap — 40 initiatives across a 5-year hold. Click any cell to edit; changes save automatically.
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

      <DeliveryPlanTable initialTasks={tasks} />
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
