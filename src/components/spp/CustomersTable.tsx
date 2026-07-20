"use client";

import { useMemo, useState } from "react";

export interface CustomerRow {
  id: string;
  customer_code: string | null;
  name: string;
  segment: string | null;
  lifetime_sales: number;
  balance: number;
  last_sale_date: string | null;
  annual: Record<number, number>;
}

type SortKey = "name" | "s2024" | "s2025" | "s2026" | "lifetime_sales" | "balance" | "last_sale_date";

const money = (v: number | null | undefined) =>
  v === null || v === undefined || v === 0 ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

const SEGMENT_STYLE: Record<string, string> = {
  top: "bg-accent-green/10 text-accent-green",
  mid: "bg-accent-blue/10 text-accent-blue",
  tail: "bg-surface text-text-secondary",
};

function yoy(prev: number | undefined, curr: number | undefined): number | null {
  if (!prev || prev === 0 || curr === undefined) return null;
  return ((curr - prev) / prev) * 100;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("lifetime_sales");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = customers.filter((c) => {
      if (segment !== "all" && (c.segment ?? "tail") !== segment) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.customer_code ?? "").toLowerCase().includes(q);
    });
    const val = (c: CustomerRow): number | string => {
      switch (sort) {
        case "name": return c.name.toLowerCase();
        case "s2024": return c.annual[2024] ?? 0;
        case "s2025": return c.annual[2025] ?? 0;
        case "s2026": return c.annual[2026] ?? 0;
        case "balance": return c.balance ?? 0;
        case "last_sale_date": return c.last_sale_date ?? "";
        default: return c.lifetime_sales ?? 0;
      }
    };
    out = [...out].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return out;
  }, [customers, query, segment, sort, dir]);

  function toggleSort(k: SortKey) {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(k); setDir(k === "name" ? "asc" : "desc"); }
  }

  // Render helper (a plain function returning JSX — NOT a nested component)
  const th = (k: SortKey, label: string, className = "") => (
    <th
      onClick={() => toggleSort(k)}
      className={`py-2 px-2 font-medium cursor-pointer select-none hover:text-foreground ${className}`}
    >
      {label}
      <span className="text-[8px] ml-0.5 opacity-60">{sort === k ? (dir === "asc" ? "▲" : "▼") : ""}</span>
    </th>
  );

  const totalLifetime = rows.reduce((s, c) => s + (Number(c.lifetime_sales) || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or code…"
          className="text-xs border border-border-custom rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-accent-blue/40 w-56"
        />
        <div className="flex gap-1">
          {["all", "top", "mid", "tail"].map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg border capitalize transition-colors ${
                segment === s ? "bg-accent-blue text-white border-transparent" : "text-text-secondary border-border-custom hover:bg-surface"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-text-secondary ml-auto">
          {rows.length} customers · {money(totalLifetime)} lifetime
        </span>
      </div>

      <div className="overflow-x-auto border border-border-custom rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-custom bg-surface text-text-secondary">
              {th("name", "Customer", "text-left")}
              <th className="py-2 px-2 font-medium text-left">Seg</th>
              {th("s2024", "2024", "text-right")}
              {th("s2025", "2025", "text-right")}
              {th("s2026", "2026", "text-right")}
              <th className="py-2 px-2 font-medium text-right">YoY 25→26</th>
              {th("lifetime_sales", "Lifetime", "text-right")}
              {th("balance", "AR Balance", "text-right")}
              {th("last_sale_date", "Last Sale", "text-right")}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const growth = yoy(c.annual[2025], c.annual[2026]);
              return (
                <tr
                  key={c.id}
                  onClick={() => { window.location.href = `/customers/${c.id}`; }}
                  className="border-b border-border-custom/50 hover:bg-surface/60 cursor-pointer"
                >
                  <td className="py-1.5 px-2 text-foreground font-medium">
                    {c.name}
                    {c.customer_code && <span className="text-text-secondary font-mono ml-1.5 text-[10px]">{c.customer_code}</span>}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${SEGMENT_STYLE[c.segment ?? "tail"]}`}>
                      {c.segment ?? "tail"}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(c.annual[2024])}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary">{money(c.annual[2025])}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-foreground">{money(c.annual[2026])}</td>
                  <td className={`py-1.5 px-2 text-right font-mono ${growth === null ? "text-text-secondary" : growth >= 0 ? "text-accent-green" : "text-red-600/80"}`}>
                    {growth === null ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-foreground font-semibold">{money(c.lifetime_sales)}</td>
                  <td className={`py-1.5 px-2 text-right font-mono ${Number(c.balance) > 0 ? "text-accent-amber" : "text-text-secondary"}`}>{money(c.balance)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-text-secondary whitespace-nowrap">{c.last_sale_date ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
