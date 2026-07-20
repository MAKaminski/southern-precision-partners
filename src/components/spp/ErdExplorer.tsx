"use client";

import { useState } from "react";
import type { ErdRelationship, ErdTable } from "@/lib/spp-queries";

function relationshipsForTable(table: string, relationships: ErdRelationship[]) {
  return {
    outgoing: relationships.filter((r) => r.source_table === table),
    incoming: relationships.filter((r) => r.target_table === table),
  };
}

export function ErdExplorer({
  tables,
  relationships,
}: {
  tables: ErdTable[];
  relationships: ErdRelationship[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Relationships summary */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">Relationships</h2>
        {relationships.length === 0 ? (
          <p className="text-xs text-text-secondary">No foreign keys found.</p>
        ) : (
          <div className="border border-border-custom rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-surface">
                <tr className="border-b border-border-custom text-text-secondary">
                  <th className="text-left py-2 px-3 font-medium">Source</th>
                  <th className="text-center py-2 px-2 font-medium">Cardinality</th>
                  <th className="text-left py-2 px-2 font-medium">Target</th>
                  <th className="text-left py-2 px-3 font-medium">On Delete</th>
                </tr>
              </thead>
              <tbody>
                {relationships.map((r) => (
                  <tr key={r.constraint_name} className="border-b border-border-custom/50 last:border-0">
                    <td className="py-1.5 px-3 font-mono text-foreground">
                      {r.source_table}.{r.source_column}
                    </td>
                    <td className="py-1.5 px-2 text-center text-[10px] text-text-secondary uppercase tracking-wide">
                      {r.cardinality}
                    </td>
                    <td className="py-1.5 px-2 font-mono text-foreground">
                      {r.target_table}.{r.target_column}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-text-secondary">{r.on_delete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Tables */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Tables</h2>
          <span className="text-[11px] text-text-secondary">{tables.length} tables</span>
        </div>
        <div className="border border-border-custom rounded-lg overflow-hidden divide-y divide-border-custom">
          {tables.map((t) => {
            const isOpen = expanded.has(t.table_name);
            const { outgoing, incoming } = relationshipsForTable(t.table_name, relationships);
            return (
              <div key={t.table_name}>
                <button
                  type="button"
                  onClick={() => toggle(t.table_name)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-border-custom/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`text-text-secondary shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    >
                      <path d="M3 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono text-sm font-semibold text-foreground">public.{t.table_name}</span>
                    <span className="text-[10px] text-text-secondary">{t.columns.length} columns</span>
                  </div>
                  <span className="text-[10px] text-text-secondary font-mono">
                    {t.row_count.toLocaleString()} rows
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-border-custom/50 bg-background/60 overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-text-secondary">
                          <th className="text-left py-1.5 pl-8 font-medium">Column</th>
                          <th className="text-left py-1.5 px-2 font-medium">Type</th>
                          <th className="text-left py-1.5 px-2 font-medium">Constraints</th>
                          <th className="text-left py-1.5 px-2 font-medium">Default</th>
                          <th className="text-left py-1.5 pr-3 font-medium">References</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.columns.map((c) => {
                          const fk = outgoing.find((r) => r.source_column === c.column_name);
                          return (
                            <tr key={c.column_name} className="border-t border-border-custom/30">
                              <td className="py-1 pl-8 font-mono text-foreground whitespace-nowrap">
                                {c.column_name}
                              </td>
                              <td className="py-1 px-2 font-mono text-text-secondary whitespace-nowrap">
                                {c.data_type}
                              </td>
                              <td className="py-1 px-2 whitespace-nowrap">
                                <span className="inline-flex gap-1">
                                  {c.is_primary_key && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue">
                                      PK
                                    </span>
                                  )}
                                  {c.is_unique && !c.is_primary_key && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green">
                                      UNIQUE
                                    </span>
                                  )}
                                  {c.is_composite_key_member && (
                                    <span
                                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue"
                                      title="Part of a multi-column unique constraint — not unique on its own"
                                    >
                                      COMPOSITE
                                    </span>
                                  )}
                                  {!c.is_nullable && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-border-custom/40 text-text-secondary">
                                      NOT NULL
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="py-1 px-2 font-mono text-text-secondary whitespace-nowrap">
                                {c.column_default ?? "—"}
                              </td>
                              <td className="py-1 pr-3 font-mono text-accent-amber whitespace-nowrap">
                                {fk ? `→ ${fk.target_table}.${fk.target_column}` : ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {incoming.length > 0 && (
                      <p className="text-[10px] text-text-secondary px-3 py-2 border-t border-border-custom/30">
                        Referenced by: {incoming.map((r) => `${r.source_table}.${r.source_column}`).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
