"use client";

import { useState } from "react";
import { outreachCampaigns, emailTemplates } from "@/lib/crm-data";
import type { OutreachTarget } from "@/lib/crm-data";

const statusColors: Record<string, string> = {
  ready: "bg-accent-blue/10 text-accent-blue",
  sent: "bg-accent-amber/10 text-accent-amber",
  responded: "bg-accent-green/10 text-accent-green",
  meeting: "bg-accent-purple/10 text-accent-purple",
  closed: "bg-accent-green/20 text-accent-green",
};

export default function OutreachPage() {
  const [activeRegion, setActiveRegion] = useState<"columbia" | "florence">("columbia");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const campaign = outreachCampaigns[activeRegion];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Growth Outreach — SC Expansion</h1>
      <p className="text-sm text-text-secondary mt-1 mb-6">
        Pre-built outreach campaigns for Columbia and Florence, SC. Click any target to launch email.
      </p>

      {/* Region tabs */}
      <div className="flex gap-2 mb-6">
        {(["columbia", "florence"] as const).map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeRegion === region
                ? "bg-accent-blue text-white"
                : "bg-surface border border-border-custom text-text-secondary hover:text-foreground"
            }`}
          >
            {region === "columbia" ? "Columbia, SC" : "Florence, SC"}
          </button>
        ))}
      </div>

      {/* Campaign header */}
      <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-foreground">{campaign.name}</h2>
        <p className="text-xs text-text-secondary mt-1">{campaign.description}</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="text-text-secondary">
            Targets: <b className="text-foreground">{campaign.targets.length}</b>
          </span>
          <span className="text-text-secondary">
            Est. Revenue Potential: <b className="text-accent-green">
              {activeRegion === "columbia" ? "$515K–$1.08M/yr" : "$225K–$450K/yr"}
            </b>
          </span>
          <span className="text-text-secondary">
            Ready: <b className="text-accent-blue">{campaign.targets.filter(t => t.status === "ready").length}</b>
          </span>
        </div>
      </div>

      {/* Target list */}
      <div className="space-y-3">
        {campaign.targets.map((target, i) => (
          <TargetCard
            key={i}
            target={target}
            onPreview={() => setPreviewTemplate(previewTemplate === target.template ? null : target.template)}
            showPreview={previewTemplate === target.template}
          />
        ))}
      </div>

      {/* Template preview modal */}
      {previewTemplate && emailTemplates[previewTemplate] && (
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
              <div className="text-sm font-medium text-foreground mb-4">{emailTemplates[previewTemplate].subject}</div>
              <div className="text-xs text-text-secondary mb-1">Body:</div>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed bg-surface border border-border-custom rounded-lg p-4">
                {emailTemplates[previewTemplate].body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetCard({ target, onPreview, showPreview }: { target: OutreachTarget; onPreview: () => void; showPreview: boolean }) {
  const template = emailTemplates[target.template];
  const mailtoBody = template ? template.body.replace("[Contact Name]", target.contactName) : "";
  const mailtoUrl = `mailto:${target.email}?subject=${encodeURIComponent(template?.subject || "")}&body=${encodeURIComponent(mailtoBody)}`;

  return (
    <div className="bg-surface border border-border-custom rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0">
          P{target.priority}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{target.company}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface border border-border-custom text-text-secondary">{target.type}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusColors[target.status]}`}>{target.status}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-text-secondary">
            <span>{target.location}</span>
            <span>{target.contactName} — {target.contactTitle}</span>
            <span>{target.phone}</span>
            <span className="text-accent-green font-medium">Est: {target.estimatedRevenue}</span>
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Channel: <span className="text-foreground">{target.channel}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onPreview}
            className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
              showPreview ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30" : "bg-surface border-border-custom text-text-secondary hover:text-foreground"
            }`}
          >
            Preview
          </button>
          <a
            href={mailtoUrl}
            className="bg-accent-blue text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-accent-blue/90 transition-colors"
          >
            Send Email
          </a>
        </div>
      </div>
    </div>
  );
}
