import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/spp-queries";
import { groupArTransactionsByInvoice } from "@/lib/ar-ledger";
import { ARLedgerInvoices } from "@/components/spp/ARLedgerInvoices";

export const dynamic = "force-dynamic";

const money = (v: number | null) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customer, annual, transactions } = await getCustomer(id);
  if (!customer) notFound();

  const invoiced = transactions.reduce((s, t) => s + (Number(t.invoice_amount) || 0), 0);
  const paid = transactions.reduce((s, t) => s + (Number(t.payment_amount) || 0), 0);
  const invoiceGroups = groupArTransactionsByInvoice(transactions);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link href="/customers" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Customer CRM
      </Link>

      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{customer.name}</h1>
          <p className="text-sm text-text-secondary">
            {customer.customer_code && <span className="font-mono">{customer.customer_code}</span>}
            {customer.segment && <span className="ml-2 capitalize">· {customer.segment} account</span>}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Kpi label="Lifetime Sales" value={money(customer.lifetime_sales)} />
          <Kpi label="AR Balance" value={money(customer.balance)} accent={Number(customer.balance) > 0} />
          <Kpi label="Invoices" value={String(customer.lifetime_sale_count)} />
        </div>
      </header>

      {/* Annual sales */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">Annual Sales</h2>
        <div className="flex gap-3 flex-wrap">
          {annual.length === 0 && <span className="text-xs text-text-secondary">No annual summary on file.</span>}
          {annual.map((a) => (
            <div key={a.year} className="bg-surface border border-border-custom rounded-lg px-4 py-2 text-center">
              <div className="text-lg font-bold text-foreground font-mono">{money(a.sales)}</div>
              <div className="text-[10px] text-text-secondary uppercase">{a.year}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Metadata */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Meta label="First Sale" value={customer.first_sale_date ?? "—"} />
        <Meta label="Last Sale" value={customer.last_sale_date ?? "—"} />
        <Meta label="Lifetime Payments" value={money(customer.lifetime_payments)} />
        <Meta label="Payment Count" value={String(customer.lifetime_payment_count)} />
      </section>

      {/* AR ledger */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">A/R Ledger</h2>
          <span className="text-[11px] text-text-secondary">
            {invoiceGroups.length} invoices · {transactions.length} lines · Invoiced {money(invoiced)} · Paid {money(paid)}
          </span>
        </div>
        {invoiceGroups.length === 0 ? (
          <p className="text-xs text-text-secondary">No A/R transactions on file.</p>
        ) : (
          <ARLedgerInvoices groups={invoiceGroups} />
        )}
        <p className="text-[10px] text-text-secondary mt-2">
          Ledger imported from the operating company&apos;s A/R export, grouped by invoice — click a row to see its
          payments and credits. Credit memos (LC-prefixed refs) are flagged
          <span className="text-accent-amber"> CR</span>. &ldquo;Unmatched / on-account&rdquo; groups payments with no
          invoice number in the source data.
        </p>
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg px-3 py-1.5 min-w-[90px]">
      <div className={`text-base font-bold font-mono ${accent ? "text-accent-amber" : "text-foreground"}`}>{value}</div>
      <div className="text-[9px] text-text-secondary uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3">
      <div className="text-[10px] text-text-secondary uppercase tracking-wide">{label}</div>
      <div className="text-foreground font-mono mt-0.5">{value}</div>
    </div>
  );
}
