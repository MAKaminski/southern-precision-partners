"use client";

import { Fragment, useMemo, useState } from "react";
import type { ProspectCompanyWithContacts } from "@/lib/spp-queries";

const money = (v: number | null) =>
  v == null ? "—" : v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

function fitTier(score: number): { label: string; cls: string } {
  if (score >= 80) return { label: "A", cls: "bg-accent-green/15 text-accent-green border-accent-green/30" };
  if (score >= 60) return { label: "B", cls: "bg-accent-blue/15 text-accent-blue border-accent-blue/30" };
  if (score >= 40) return { label: "C", cls: "bg-accent-amber/15 text-accent-amber border-accent-amber/30" };
  return { label: "D", cls: "bg-border-custom/40 text-text-secondary border-border-custom" };
}

export function ProspectsExplorer({ prospects }: { prospects: ProspectCompanyWithContacts[] }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("all");
  const [tier, setTier] = useState("all");
  const [onlyCandidates, setOnlyCandidates] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const regions = useMemo(
    () => [...new Set(prospects.map((p) => p.region).filter(Boolean))].sort() as string[],
    [prospects],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return prospects.filter((p) => {
      if (region !== "all" && p.region !== region) return false;
      if (onlyCandidates && !p.matched_customer_id) return false;
      if (tier !== "all") {
        const t = fitTier(p.fit_score).label;
        if (t !== tier) return false;
      }
      if (needle) {
        const hay = [p.name, p.city, p.industry, p.keywords, ...p.contacts.map((c) => `${c.first_name} ${c.last_name} ${c.title}`)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [prospects, q, region, tier, onlyCandidates]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, contact, keyword…"
          className="flex-1 min-w-[12rem] rounded-md border border-border-custom bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-border-custom bg-surface px-2 py-1.5 text-xs text-foreground"
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="rounded-md border border-border-custom bg-surface px-2 py-1.5 text-xs text-foreground"
        >
          <option value="all">All fit tiers</option>
          <option value="A">A (80+)</option>
          <option value="B">B (60–79)</option>
          <option value="C">C (40–59)</option>
          <option value="D">D (&lt;40)</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyCandidates}
            onChange={(e) => setOnlyCandidates(e.target.checked)}
            className="accent-accent-blue"
          />
          Enrichment candidates only
        </label>
      </div>

      <div className="text-[11px] text-text-secondary">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {prospects.length} companies
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border-custom rounded-lg">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-surface text-text-secondary">
            <tr className="border-b border-border-custom">
              <th className="text-left py-2 px-3 font-medium w-8"></th>
              <th className="text-left py-2 px-2 font-medium">Company</th>
              <th className="text-left py-2 px-2 font-medium">Region</th>
              <th className="text-right py-2 px-2 font-medium">Revenue</th>
              <th className="text-right py-2 px-2 font-medium">Emp.</th>
              <th className="text-center py-2 px-2 font-medium">Contacts</th>
              <th className="text-center py-2 px-2 font-medium">Fit</th>
              <th className="text-left py-2 px-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const t = fitTier(p.fit_score);
              const isOpen = expanded.has(p.id);
              return (
                <Fragment key={p.id}>
                  <tr
                    className="border-b border-border-custom/50 last:border-0 hover:bg-surface/60 cursor-pointer align-top"
                    onClick={() => toggle(p.id)}
                  >
                    <td className="py-2 px-3 text-text-secondary">{isOpen ? "▾" : "▸"}</td>
                    <td className="py-2 px-2">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-[10px] text-text-secondary">
                        {p.website ?? "—"}
                        {p.city ? ` · ${p.city}, ${p.state ?? ""}` : ""}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-text-secondary">{p.region ?? "—"}</td>
                    <td className="py-2 px-2 text-right font-mono text-text-secondary">{p.revenue_range ?? "—"}</td>
                    <td className="py-2 px-2 text-right font-mono text-text-secondary">{p.employees ?? "—"}</td>
                    <td className="py-2 px-2 text-center text-text-secondary">{p.contacts.length}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-bold ${t.cls}`} title={`Fit score ${p.fit_score}/100`}>
                        {t.label} · {p.fit_score}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {p.matched_customer_id ? (
                        <span
                          className="inline-flex items-center rounded border border-accent-amber/30 bg-accent-amber/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-amber"
                          title={`Appears to already be customer "${p.matched_customer?.name ?? ""}" — enrichment candidate (${p.match_confidence})`}
                        >
                          Existing customer?
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wide text-accent-green">New prospect</span>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-border-custom/50 bg-surface/40">
                      <td></td>
                      <td colSpan={7} className="py-3 px-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left: firmographics */}
                          <div className="space-y-1.5 text-[11px]">
                            <div className="text-[9px] uppercase tracking-wide text-text-secondary">Firmographics</div>
                            {p.industry && <div><span className="text-text-secondary">Industry:</span> {p.industry}</div>}
                            <div><span className="text-text-secondary">Revenue:</span> {p.revenue_range ?? "—"}{p.revenue ? ` (${money(p.revenue)})` : ""}</div>
                            <div><span className="text-text-secondary">Employees:</span> {p.employees ?? "—"} {p.size_range ? `(${p.size_range})` : ""}</div>
                            {(p.street || p.city) && (
                              <div><span className="text-text-secondary">HQ:</span> {[p.street, p.city, p.state, p.zip].filter(Boolean).join(", ")}</div>
                            )}
                            {(p.email || p.phone) && (
                              <div><span className="text-text-secondary">Direct:</span> {[p.email, p.phone].filter(Boolean).join(" · ")}</div>
                            )}
                            {p.fit_evidence && (
                              <div className="pt-1"><span className="text-text-secondary">Why this fit:</span> <span className="text-foreground/80">{p.fit_evidence}</span></div>
                            )}
                            {p.matched_customer && (
                              <div className="mt-1 rounded border border-accent-amber/30 bg-accent-amber/5 p-2">
                                <span className="text-accent-amber font-medium">Enrichment candidate</span> — likely the existing
                                customer <strong>{p.matched_customer.name}</strong>
                                {p.matched_customer.customer_code ? ` (${p.matched_customer.customer_code})` : ""}
                                {`, lifetime sales ${money(p.matched_customer.lifetime_sales)}`}.{" "}
                                <span className="text-text-secondary">Match: {p.match_confidence}. Review before applying — not auto-written.</span>
                              </div>
                            )}
                            {p.description && <p className="text-text-secondary pt-1 leading-relaxed">{p.description}</p>}
                          </div>
                          {/* Right: contacts */}
                          <div className="space-y-2">
                            <div className="text-[9px] uppercase tracking-wide text-text-secondary">Decision-makers ({p.contacts.length})</div>
                            {p.contacts.map((c) => (
                              <div key={c.id} className="text-[11px] border-l-2 border-border-custom pl-2">
                                <div className="font-medium text-foreground">
                                  {[c.first_name, c.last_name].filter(Boolean).join(" ")}
                                  {c.management_level && <span className="ml-1.5 text-[9px] text-accent-blue">{c.management_level}</span>}
                                </div>
                                <div className="text-text-secondary">{c.title ?? "—"}{c.department ? ` · ${c.department}` : ""}</div>
                                {c.linkedin_url && (
                                  <a href={c.linkedin_url.startsWith("http") ? c.linkedin_url : `https://${c.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline" onClick={(e) => e.stopPropagation()}>
                                    LinkedIn ↗
                                  </a>
                                )}
                              </div>
                            ))}
                            {!p.contacts.length && <div className="text-[11px] text-text-secondary italic">No named contacts.</div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
