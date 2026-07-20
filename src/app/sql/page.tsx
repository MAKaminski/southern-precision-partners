import { getSchemaErd, sppDbConfigured } from "@/lib/spp-queries";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { SqlConsole } from "@/components/spp/SqlConsole";

export const dynamic = "force-dynamic";

export default async function SqlConsolePage() {
  const erd = await getSchemaErd();
  const configured = sppDbConfigured();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Project Mosaic
      </a>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">SQL Console</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          Query the live Supabase database directly — browse Table.Column on the left, write SELECT / WITH SQL on
          the right. Read-only is enforced at the database level (not just checked in this UI), so there&apos;s no
          way to modify data from here.
        </p>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>).
        </div>
      ) : !erd ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Could not load the schema.
        </div>
      ) : (
        <SqlConsole tables={erd.tables} />
      )}
    </div>
  );
}
