import type { ArTransaction } from "@/lib/spp-queries";

// Groups the raw ar_transactions ledger lines by invoice_number: real AR
// exports repeat the invoice_number/date across every line that applies a
// payment or credit against that invoice, but only carry invoice_amount on
// one of those lines. See ar_transactions.line_key comment for why a single
// invoice can legitimately span many rows (partial payments, credit memos).
// Rows with no invoice_number (on-account payments, not tied to any
// invoice) are bucketed into a synthetic "unmatched" group so nothing in
// the ledger is silently dropped from the page.

export interface InvoiceGroupLine {
  id: string;
  paymentDate: string | null;
  paymentRef: string | null;
  paymentAmount: number | null;
  isCreditMemo: boolean;
}

export interface InvoiceGroup {
  key: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceAmount: number;
  paymentTotal: number;
  outstandingBalance: number;
  hasCreditMemo: boolean;
  lines: InvoiceGroupLine[];
}

export const UNMATCHED_INVOICE_KEY = "__unmatched__";

interface GroupAccumulator {
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceDateIsFromInvoiceLine: boolean;
  invoiceAmount: number;
  paymentTotal: number;
  hasCreditMemo: boolean;
  lines: InvoiceGroupLine[];
}

export function groupArTransactionsByInvoice(transactions: ArTransaction[]): InvoiceGroup[] {
  const groups = new Map<string, GroupAccumulator>();

  for (const t of transactions) {
    const key = t.invoice_number ?? UNMATCHED_INVOICE_KEY;
    let g = groups.get(key);
    if (!g) {
      g = {
        invoiceNumber: t.invoice_number,
        invoiceDate: null,
        invoiceDateIsFromInvoiceLine: false,
        invoiceAmount: 0,
        paymentTotal: 0,
        hasCreditMemo: false,
        lines: [],
      };
      groups.set(key, g);
    }

    const hasInvoiceAmount = t.invoice_amount !== null && t.invoice_amount !== undefined;
    if (hasInvoiceAmount) {
      g.invoiceAmount += Number(t.invoice_amount);
      // The line carrying the actual invoice_amount is the authoritative
      // source for the invoice's date — prefer it over an echoed date on a
      // payment-only line sharing the same invoice_number.
      if (!g.invoiceDateIsFromInvoiceLine) {
        g.invoiceDate = t.invoice_date;
        g.invoiceDateIsFromInvoiceLine = true;
      }
    } else if (!g.invoiceDateIsFromInvoiceLine && !g.invoiceDate && t.invoice_date) {
      g.invoiceDate = t.invoice_date;
    }

    if (t.payment_amount !== null && t.payment_amount !== undefined) {
      g.paymentTotal += Number(t.payment_amount);
    }
    if (t.is_credit_memo) g.hasCreditMemo = true;

    g.lines.push({
      id: t.id,
      paymentDate: t.payment_date,
      paymentRef: t.payment_ref,
      paymentAmount: t.payment_amount,
      isCreditMemo: t.is_credit_memo,
    });
  }

  return Array.from(groups.entries())
    .map(([key, g]) => ({
      key,
      invoiceNumber: g.invoiceNumber,
      invoiceDate: g.invoiceDate,
      invoiceAmount: g.invoiceAmount,
      paymentTotal: g.paymentTotal,
      outstandingBalance: g.invoiceAmount - g.paymentTotal,
      hasCreditMemo: g.hasCreditMemo,
      lines: g.lines,
    }))
    .sort((a, b) => {
      if (a.key === UNMATCHED_INVOICE_KEY) return 1;
      if (b.key === UNMATCHED_INVOICE_KEY) return -1;
      return (a.invoiceDate ?? "").localeCompare(b.invoiceDate ?? "");
    });
}
