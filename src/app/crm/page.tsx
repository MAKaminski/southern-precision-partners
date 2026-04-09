"use client";

import { useState } from "react";
import { initiativeGroups } from "@/lib/crm-grouped";

const phaseColors: Record<number, string> = {
  1: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
  2: "bg-accent-green/10 text-accent-green border-accent-green/20",
  3: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
};

const statusBadge: Record<string, string> = {
  ready: "bg-accent-blue/10 text-accent-blue",
  "in-progress": "bg-accent-amber/10 text-accent-amber",
  contacted: "bg-accent-green/10 text-accent-green",
  "follow-up": "bg-accent-purple/10 text-accent-purple",
  closed: "bg-accent-green/20 text-accent-green",
};

export default function CRMPage() {
  const [expandedGroup, setExpandedGroup] = useState<number | null>(0);
  const totalContacts = initiativeGroups.reduce((sum, g) => sum + g.contacts.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-foreground">Initiative CRM</h1>
        <div className="flex gap-2 text-xs">
          <span className="text-text-secondary">{initiativeGroups.length} initiatives</span>
          <span className="text-text-secondary">|</span>
          <span className="text-text-secondary">{totalContacts} contacts</span>
        </div>
      </div>
      <p className="text-sm text-text-secondary mb-6">
        Contacts organized by the deal initiative they support. Click any group to expand contacts ranked by outreach priority.
      </p>

      {/* Phase legend */}
      <div className="flex gap-3 mb-6">
        <span className="text-[10px] font-medium px-2 py-1 rounded bg-accent-blue/10 text-accent-blue">Phase 1 — Financial Engineering</span>
        <span className="text-[10px] font-medium px-2 py-1 rounded bg-accent-green/10 text-accent-green">Phase 2 — Revenue Acceleration</span>
        <span className="text-[10px] font-medium px-2 py-1 rounded bg-accent-amber/10 text-accent-amber">Phase 3 — Scale &amp; Exit</span>
      </div>

      <div className="space-y-3">
        {initiativeGroups.map((group, gi) => (
          <div key={gi} className={`border rounded-lg overflow-hidden ${phaseColors[group.phase]}`}>
            {/* Group header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => setExpandedGroup(expandedGroup === gi ? null : gi)}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: group.color, color: "white" }}>
                P{group.phase}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{group.initiative}</div>
                <div className="text-xs text-text-secondary">{group.description}</div>
              </div>
              <span className="text-xs font-semibold text-accent-green shrink-0">{group.ebitdaImpact}</span>
              <span className="text-xs text-text-secondary shrink-0">{group.contacts.length} contacts</span>
              <svg className={`w-4 h-4 text-text-secondary transition-transform ${expandedGroup === gi ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>

            {/* Expanded contacts */}
            {expandedGroup === gi && (
              <div className="border-t border-border-custom bg-background px-4 py-3">
                <div className="space-y-2">
                  {group.contacts.map((contact, ci) => (
                    <div key={ci} className="flex items-start gap-3 p-3 bg-surface border border-border-custom rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ color: group.color }}>
                        {contact.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {contact.url ? (
                            <a href={contact.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-blue hover:underline">{contact.company}</a>
                          ) : (
                            <span className="text-sm font-medium text-foreground">{contact.company}</span>
                          )}
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${statusBadge[contact.status]}`}>{contact.status}</span>
                        </div>
                        <div className="text-xs text-text-secondary">{contact.name} — {contact.title}</div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <a href={`mailto:${contact.email}`} className="text-xs text-accent-blue hover:underline">{contact.email}</a>
                          <span className="text-xs text-text-secondary">{contact.phone}</span>
                        </div>
                        {contact.notes && <p className="text-[11px] text-text-secondary mt-1 italic">{contact.notes}</p>}
                      </div>
                      <a
                        href={`mailto:${contact.email}?subject=${encodeURIComponent(`Project Mosaic — ${group.initiative} Inquiry`)}&body=${encodeURIComponent(`Dear ${contact.name},\n\nI'm reaching out regarding ${group.initiative.toLowerCase()} for a tile distribution business we are acquiring in Georgia.\n\nWe are specifically interested in your capabilities related to: ${group.description}\n\nDeal size: $3.1M LBO | Annual revenue: $4.8M+ | 5% organic growth\n\nWould you be available for a brief call to discuss?\n\nBest regards,\nKeith Piper\nManaging Partner, Southern Precision Partners\ndeals@sep-partners.com\n(704) 920-8593`)}`}
                        className="shrink-0 bg-accent-blue text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-accent-blue/90 transition-colors"
                      >
                        Reach Out
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
