import { getSchemaErd } from "@/lib/spp-queries";
import { ErdExplorer } from "@/components/spp/ErdExplorer";

export const dynamic = "force-dynamic";

export default async function ErdPage() {
  const erd = await getSchemaErd();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Schema ERD</h1>
        <p className="text-sm text-text-secondary mt-1">
          Live map of every table, column, and relationship in the SPP Supabase project — read directly from
          <code className="mx-1 text-[11px] bg-surface border border-border-custom rounded px-1 py-0.5">
            information_schema
          </code>
          , not hand-maintained. Review this before any new migration: extend an existing table before adding a
          new one, and confirm a field isn&apos;t already covered elsewhere.
        </p>
        {erd && (
          <p className="text-[10px] text-text-secondary mt-2">
            Generated {new Date(erd.generated_at).toLocaleString()}
          </p>
        )}
      </header>

      {!erd ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-sm rounded-lg p-4">
          Database connection not configured (missing SUPABASE_SERVICE_ROLE_KEY). Once set, the live schema
          appears here.
        </div>
      ) : (
        <ErdExplorer tables={erd.tables} relationships={erd.relationships} />
      )}
    </div>
  );
}
