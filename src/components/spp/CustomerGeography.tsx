import type { CustomerWithSales } from "@/lib/spp-queries";

const money = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${Math.round(v).toLocaleString()}`;

function groupBy(customers: CustomerWithSales[], key: (c: CustomerWithSales) => string | null) {
  const m = new Map<string, CustomerWithSales[]>();
  for (const c of customers) {
    const k = key(c) || "Not on file";
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(c);
  }
  return [...m.entries()]
    .map(([label, rows]) => ({
      label,
      count: rows.length,
      totalSales: rows.reduce((s, r) => s + (Number(r.lifetime_sales) || 0), 0),
    }))
    .sort((a, b) => (a.label === "Not on file" ? 1 : b.label === "Not on file" ? -1 : b.count - a.count));
}

export function CustomerGeography({ customers }: { customers: CustomerWithSales[] }) {
  const byState = groupBy(customers, (c) => c.state);
  byState.sort((a, b) => b.count - a.count);
  const byStore = groupBy(customers, (c) => c.primary_store);
  byStore.sort((a, b) => b.count - a.count);

  const known = customers.filter((c) => c.city || c.state || c.address_line1).length;

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-1">Geography &amp; Store</h2>
      <p className="text-[11px] text-text-secondary mb-2">
        {known === 0
          ? "No customers have an address or store on file yet — enter contact info on a customer's page to start building this out."
          : `${known} of ${customers.length} customers have some location info on file.`}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GroupTable title="By State" rows={byState} />
        <GroupTable title="By Primary Store" rows={byStore} />
      </div>
    </section>
  );
}

function GroupTable({ title, rows }: { title: string; rows: { label: string; count: number; totalSales: number }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-secondary mb-1">{title}</h3>
      <div className="overflow-x-auto border border-border-custom rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-surface">
            <tr className="border-b border-border-custom text-text-secondary">
              <th className="text-left py-1.5 px-3 font-medium">{title === "By State" ? "State" : "Store"}</th>
              <th className="text-right py-1.5 px-2 font-medium">Customers</th>
              <th className="text-right py-1.5 px-3 font-medium">Lifetime Sales</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={`border-b border-border-custom/50 last:border-0 ${r.label === "Not on file" ? "italic text-text-secondary" : ""}`}>
                <td className="py-1 px-3">{r.label}</td>
                <td className="py-1 px-2 text-right font-mono text-text-secondary">{r.count}</td>
                <td className="py-1 px-3 text-right font-mono text-text-secondary">{money(r.totalSales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
