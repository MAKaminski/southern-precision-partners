"use client";

import { useMemo, useRef, useState } from "react";
import type { ErdTable } from "@/lib/spp-queries";

type Row = Record<string, unknown>;

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function SqlConsole({ tables }: { tables: ErdTable[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("select * from public.customers order by lifetime_sales desc limit 50");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [limited, setLimited] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const keys = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) keys.add(k);
    return [...keys];
  }, [rows]);

  function toggleTable(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) {
      setQuery((q) => q + text);
      return;
    }
    const start = el.selectionStart ?? query.length;
    const end = el.selectionEnd ?? query.length;
    const next = query.slice(0, start) + text + query.slice(end);
    setQuery(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    });
  }

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Query failed");
        setRows(null);
        setLimited(false);
        return;
      }
      setRows(json.rows as Row[]);
      setLimited(!!json.limited);
    } catch {
      setError("Network error running query");
      setRows(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
      {/* Left: collapsible Table.Column browser */}
      <div className="border border-border-custom rounded-lg overflow-hidden h-fit md:sticky md:top-4">
        <div className="bg-surface px-3 py-2 text-xs font-semibold text-foreground border-b border-border-custom">
          Schema
        </div>
        <div className="max-h-[70vh] overflow-y-auto text-xs">
          {tables.map((t) => {
            const isOpen = expanded.has(t.table_name);
            return (
              <div key={t.table_name} className="border-b border-border-custom/40 last:border-0">
                <button
                  onClick={() => toggleTable(t.table_name)}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-surface"
                >
                  <span className="font-mono text-foreground">
                    <span className="text-text-secondary mr-1">{isOpen ? "▾" : "▸"}</span>
                    {t.table_name}
                  </span>
                  <span className="text-[10px] text-text-secondary">{t.row_count}</span>
                </button>
                {isOpen && (
                  <div className="pb-1">
                    <button
                      onClick={() => insertAtCursor(`select * from public.${t.table_name} limit 50`)}
                      className="block w-full text-left pl-7 pr-3 py-0.5 text-[10px] text-accent-blue hover:underline"
                    >
                      SELECT * FROM {t.table_name}
                    </button>
                    {t.columns.map((c) => (
                      <button
                        key={c.column_name}
                        onClick={() => insertAtCursor(c.column_name)}
                        className="block w-full text-left pl-7 pr-3 py-0.5 font-mono text-text-secondary hover:bg-accent-blue/10"
                        title={`${c.data_type}${c.is_primary_key ? " · primary key" : ""}`}
                      >
                        {c.column_name}
                        <span className="text-[9px] text-text-secondary/70 ml-1">{c.data_type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: editor + results */}
      <div className="space-y-3 min-w-0">
        <div>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); }
            }}
            rows={6}
            spellCheck={false}
            className="w-full text-xs font-mono border border-border-custom rounded-lg p-3 bg-surface focus:outline-none focus:border-accent-blue/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={run}
              disabled={running}
              className="text-xs px-3 py-1.5 rounded-lg bg-accent-blue text-white disabled:opacity-50"
            >
              {running ? "Running…" : "Run (⌘/Ctrl+Enter)"}
            </button>
            <span className="text-[10px] text-text-secondary">
              Read-only — SELECT / WITH only, capped at 500 rows and a 5s timeout, enforced at the database level.
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs rounded-lg p-3 font-mono whitespace-pre-wrap">
            {error}
          </div>
        )}

        {rows && (
          <div className="overflow-auto border border-border-custom rounded-lg max-h-[60vh]">
            <table className="w-full text-xs">
              <thead className="bg-surface sticky top-0">
                <tr className="border-b border-border-custom text-text-secondary">
                  {columns.map((c) => (
                    <th key={c} className="text-left py-2 px-3 font-medium whitespace-nowrap">{c}</th>
                  ))}
                  {columns.length === 0 && <th className="text-left py-2 px-3 font-medium">Result</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="py-3 px-3 text-text-secondary" colSpan={Math.max(columns.length, 1)}>
                      Query returned no rows.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b border-border-custom/50 last:border-0">
                      {columns.map((c) => (
                        <td key={c} className="py-1.5 px-3 font-mono text-text-secondary whitespace-nowrap">
                          {formatCell(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {rows && (
          <p className="text-[10px] text-text-secondary">
            {rows.length} row{rows.length === 1 ? "" : "s"}{limited ? " (capped at 500 — narrow your query for more)" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
