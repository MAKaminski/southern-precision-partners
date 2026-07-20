"use client";

import { Fragment, useState } from "react";
import type { InvoiceGroup } from "@/lib/ar-ledger";
import { UNMATCHED_INVOICE_KEY } from "@/lib/ar-ledger";

const money = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

export function ARLedgerInvoices({ groups }: { groups: InvoiceGroup[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto border border-border-custom rounded-lg max-h-[560px] overflow-y-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-surface">
          <tr className="border-b border-border-custom text-text-secondary">
            <th className="w-6" />
            <th className="text-left py-2 px-2 font-medium">Invoice #</th>
            <th className="text-left py-2 px-2 font-medium">Invoice Date</th>
            <th className="text-right py-2 px-2 font-medium">Invoice Amt</th>
            <th className="text-right py-2 px-2 font-medium">Paid / Credited</th>
            <th className="text-right py-2 px-3 font-medium">Outstanding</th>
            <th className="text-right py-2 px-3 font-medium">Payments</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const isOpen = expanded.has(g.key);
            const isUnmatched = g.key === UNMATCHED_INVOICE_KEY;
            return (
              <Fragment key={g.key}>
                <tr
                  onClick={() => toggle(g.key)}
                  className={`border-b border-border-custom/50 cursor-pointer hover:bg-border-custom/20 ${
                    g.hasCreditMemo ? "bg-accent-amber/5" : ""
                  }`}
                >
                  <td className="pl-3">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`text-text-secondary transition-transform ${isOpen ? "rotate-90" : ""}`}
                    >
                      <path d="M3 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </td>
                  <td className="py-1.5 px-2 font-mono text-foreground">
                    {isUnmatched ? (
                      <span className="italic text-text-secondary">Unmatched / on-account</span>
                    ) : (
                      g.invoiceNumber
                    )}
                    {g.hasCreditMemo && <span className="ml-1.5 text-[9px] text-accent-amber">CR</span>}
                  </td>
                  <td className="py-1.5 px-2 font-mono text-text-secondary whitespace-nowrap">
                    {g.invoiceDate ?? "—"}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-foreground">
                    {isUnmatched ? "—" : money(g.invoiceAmount)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-accent-green">{money(g.paymentTotal)}</td>
                  <td
                    className={`py-1.5 px-3 text-right font-mono ${
                      g.outstandingBalance > 0.01 ? "text-accent-amber font-semibold" : "text-text-secondary"
                    }`}
                  >
                    {money(g.outstandingBalance)}
                  </td>
                  <td className="py-1.5 px-3 text-right text-text-secondary">{g.lines.length}</td>
                </tr>
                {isOpen && (
                  <tr className="border-b border-border-custom/50 bg-background/60">
                    <td colSpan={7} className="p-0">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-text-secondary">
                            <th className="w-6" />
                            <th className="text-left py-1.5 pl-2 font-medium">Payment / Credit Ref</th>
                            <th className="text-left py-1.5 px-2 font-medium">Date</th>
                            <th className="text-right py-1.5 pr-3 font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.lines.map((l) => (
                            <tr key={l.id} className="border-t border-border-custom/30">
                              <td className="w-6" />
                              <td className="py-1 pl-2 font-mono text-text-secondary">
                                {l.paymentRef ?? "—"}
                                {l.isCreditMemo && <span className="ml-1.5 text-[9px] text-accent-amber">CR</span>}
                              </td>
                              <td className="py-1 px-2 font-mono text-text-secondary whitespace-nowrap">
                                {l.paymentDate ?? "—"}
                              </td>
                              <td className="py-1 pr-3 text-right font-mono text-accent-green">
                                {money(l.paymentAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
