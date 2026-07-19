import { getCustomers, sppDbConfigured } from "@/lib/spp-queries";
import { CustomersTable, type CustomerRow } from "@/components/spp/CustomersTable";
import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-dynamic";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v / 1000)}K`;

export default async function CustomersPage() {
  const customers = await getCustomers();
  const configured = sppDbConfigured();

  const rows: CustomerRow[] = customers.map((c) => ({
    id: c.id,
    customer_code: c.customer_code,
    name: c.name,
    segment: c.segment,
    lifetime_sales: Number(c.lifetime_sales) || 0,
    balance: Number(c.balance) || 0,
    last_sale_date: c.last_sale_date,
    annual: c.annual,
  }));

  const total2026 = rows.reduce((s, c) => s + (c.annual[2026] ?? 0), 0);
  const total2025 = rows.reduce((s, c) => s + (c.annual[2025] ?? 0), 0);
  const total2024 = rows.reduce((s, c) => s + (c.annual[2024] ?? 0), 0);
  const openAR = rows.reduce((s, c) => s + (c.balance > 0 ? c.balance : 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
          &larr; Project Mosaic
        </a>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Customer CRM</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          The acquired book of business — every customer with annual sales, lifetime value, and open A/R.
          Sourced from the operating company&apos;s records; click any row for the full ledger.
        </p>
      </header>

      {!configured ? (
        <div className="bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs rounded-lg p-3">
          Database connection not configured (missing <code>SUPABASE_SERVICE_ROLE_KEY</code>). Once set and the
          Mosaic loader has run, customers appear here.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Kpi label="Customers" value={String(rows.length)} />
            <Kpi label="2024 Sales" value={money(total2024)} />
            <Kpi label="2025 Sales" value={money(total2025)} />
            <Kpi label="2026 Sales" value={money(total2026)} />
            <Kpi label="Open A/R" value={money(openAR)} />
          </div>
          <CustomersTable customers={rows} />
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
