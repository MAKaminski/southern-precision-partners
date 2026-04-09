"use client";

import { useState, useMemo } from "react";
import { expandedCampaigns, enrichTarget } from "@/lib/outreach-expanded";
import { generatedCampaigns } from "@/lib/outreach-generator";
import { emailTemplates } from "@/lib/crm-data";
import type { OutreachTarget } from "@/lib/outreach-expanded";

const statusColors: Record<string, string> = {
  ready: "bg-accent-blue/10 text-accent-blue",
  sent: "bg-accent-amber/10 text-accent-amber",
  responded: "bg-accent-green/10 text-accent-green",
  meeting: "bg-accent-purple/10 text-accent-purple",
  closed: "bg-accent-green/20 text-accent-green",
};

const regionKeys = ["columbia", "florence", "charleston", "greenville", "myrtleBeach"] as const;
type RegionKey = (typeof regionKeys)[number];

const regionLabels: Record<RegionKey, string> = {
  columbia: "Columbia",
  florence: "Florence",
  charleston: "Charleston",
  greenville: "Greenville",
  myrtleBeach: "Myrtle Beach",
};

export default function OutreachPage() {
  const [activeRegion, setActiveRegion] = useState<RegionKey>("columbia");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // Merge hand-picked (priority) + generated targets, dedup by company name
  const campaign = useMemo(() => {
    const handPicked = expandedCampaigns[activeRegion]?.targets || [];
    const generated = generatedCampaigns[activeRegion]?.targets || [];
    const meta = generatedCampaigns[activeRegion] || expandedCampaigns[activeRegion];
    const seen = new Set<string>();
    const merged: OutreachTarget[] = [];
    // Hand-picked first (they have priority)
    for (const t of handPicked.map(enrichTarget)) {
      if (!seen.has(t.company)) { seen.add(t.company); merged.push(t); }
    }
    // Then generated
    for (const t of generated) {
      if (!seen.has(t.company)) { seen.add(t.company); merged.push(t); }
    }
    return { ...meta, targets: merged };
  }, [activeRegion]);

  const allTypes = Array.from(new Set(campaign.targets.map((t) => t.type))).sort();
  const filtered = filterType === "all" ? campaign.targets : campaign.targets.filter((t) => t.type === filterType);
  const filteredTargets = filtered.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = filteredTargets.length < filtered.length;
  const totalTargets = Object.values(generatedCampaigns).reduce((sum, c) => sum + c.targets.length, 0) + Object.values(expandedCampaigns).reduce((sum, c) => sum + c.targets.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Growth Outreach — SC Expansion</h1>
        <span className="text-xs text-text-secondary bg-surface border border-border-custom px-2 py-1 rounded">
          {totalTargets} total targets across {regionKeys.length} markets
        </span>
      </div>
      <p className="text-sm text-text-secondary mt-1 mb-6">
        Pre-built outreach campaigns across South Carolina. Click any target to preview email template and send.
      </p>

      {/* Region tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {regionKeys.map((region) => {
          const hp = expandedCampaigns[region]?.targets.length || 0;
          const gn = generatedCampaigns[region]?.targets.length || 0;
          return (
            <button
              key={region}
              onClick={() => { setActiveRegion(region); setFilterType("all"); setPage(0); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeRegion === region
                  ? "bg-accent-blue text-white"
                  : "bg-surface border border-border-custom text-text-secondary hover:text-foreground"
              }`}
            >
              {regionLabels[region]} ({hp + gn})
            </button>
          );
        })}
      </div>

      {/* Campaign header */}
      <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-4 mb-4">
        <h2 className="text-sm font-semibold text-foreground">{campaign.name}</h2>
        <p className="text-xs text-text-secondary mt-1">{campaign.description}</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-text-secondary">Targets: <b className="text-foreground">{campaign.targets.length}</b></span>
          <span className="text-text-secondary">Rev Potential: <b className="text-accent-green">{campaign.revenueTarget}</b></span>
          <span className="text-text-secondary">Ready: <b className="text-accent-blue">{campaign.targets.filter(t => t.status === "ready").length}</b></span>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setFilterType("all")}
          className={`text-[10px] px-2 py-1 rounded transition-colors ${filterType === "all" ? "bg-accent-blue text-white" : "bg-surface border border-border-custom text-text-secondary"}`}
        >
          All ({campaign.targets.length})
        </button>
        {allTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`text-[10px] px-2 py-1 rounded transition-colors ${filterType === type ? "bg-accent-blue text-white" : "bg-surface border border-border-custom text-text-secondary"}`}
          >
            {type} ({campaign.targets.filter(t => t.type === type).length})
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="text-xs text-text-secondary mb-2">
        Showing {filteredTargets.length} of {filtered.length} targets
        {filterType !== "all" && ` (filtered: ${filterType})`}
      </div>

      {/* Target list */}
      <div className="space-y-2">
        {filteredTargets.map((target, i) => (
          <TargetCard key={i} target={target} onPreview={() => setPreviewTemplate(previewTemplate === `${i}-${target.template}` ? null : `${i}-${target.template}`)} showPreview={previewTemplate === `${i}-${target.template}`} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={() => setPage(page + 1)}
            className="bg-accent-blue text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Load More ({filtered.length - filteredTargets.length} remaining)
          </button>
        </div>
      )}

      {/* Template preview modal */}
      {previewTemplate && (() => {
        const templateKey = previewTemplate.split("-").slice(1).join("-");
        const template = emailTemplates[templateKey];
        if (!template) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}>
            <div className="bg-background border border-border-custom rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-background border-b border-border-custom px-5 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Email Template Preview</h3>
                <button onClick={() => setPreviewTemplate(null)} className="text-text-secondary hover:text-foreground">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="px-5 py-4">
                <div className="text-xs text-text-secondary mb-1">Subject:</div>
                <div className="text-sm font-medium text-foreground mb-4">{template.subject}</div>
                <div className="text-xs text-text-secondary mb-1">Body:</div>
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-surface border border-border-custom rounded-lg p-4">{template.body}</pre>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function TargetCard({ target, onPreview, showPreview }: { target: OutreachTarget; onPreview: () => void; showPreview: boolean }) {
  const template = emailTemplates[target.template];
  const contactLabel = target.contactName || target.contactTitle;
  const mailtoBody = template ? template.body.replace("[Contact Name]", contactLabel) : "";
  const mailtoUrl = `mailto:${target.email}?subject=${encodeURIComponent(template?.subject || "Tile Center Group — Introduction")}&body=${encodeURIComponent(mailtoBody)}`;

  return (
    <div className={`bg-surface border border-border-custom rounded-lg p-3 ${showPreview ? "ring-2 ring-accent-blue/30" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue text-[10px] font-bold shrink-0 mt-0.5">
          P{target.priority}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{target.company}</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-background border border-border-custom text-text-secondary">{target.type}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColors[target.status]}`}>{target.status}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-text-secondary">
            <span>{target.location}</span>
            <span>{target.contactTitle}</span>
            <a href={`mailto:${target.email}`} className="text-accent-blue hover:underline">{target.email}</a>
            <a href={`tel:${target.phone}`} className="hover:text-foreground">{target.phone}</a>
            <span className="text-accent-green font-medium">{target.estimatedRevenue}</span>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onPreview} className="text-[10px] font-medium px-2 py-1 rounded border border-border-custom text-text-secondary hover:text-foreground transition-colors">
            Preview
          </button>
          <a href={mailtoUrl} className="bg-accent-blue text-white text-[10px] font-medium px-2 py-1 rounded hover:bg-accent-blue/90 transition-colors">
            Email
          </a>
          <a href={`tel:${target.phone}`} className="bg-accent-green text-white text-[10px] font-medium px-2 py-1 rounded hover:bg-accent-green/90 transition-colors">
            Call
          </a>
        </div>
      </div>
    </div>
  );
}
