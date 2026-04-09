"use client";

import { useState } from "react";
import { lenderCRM } from "@/lib/crm-data";

const statusColors: Record<string, string> = {
  ready: "bg-accent-blue/10 text-accent-blue",
  "in-progress": "bg-accent-amber/10 text-accent-amber",
  contacted: "bg-accent-green/10 text-accent-green",
  "follow-up": "bg-accent-purple/10 text-accent-purple",
};

export default function CRMPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lender CRM</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lenderCRM.length} lenders ranked by outreach priority. Click &quot;Start Outreach&quot; to initiate contact sequence.
          </p>
        </div>
        <div className="flex gap-2">
          {Object.entries(statusColors).map(([status, color]) => (
            <span key={status} className={`text-[10px] font-medium px-2 py-1 rounded capitalize ${color}`}>
              {status}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {lenderCRM.map((lender, i) => (
          <div key={lender.company} className="bg-surface border border-border-custom rounded-lg overflow-hidden">
            {/* Header row */}
            <div
              className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-border-custom/20 transition-colors"
              onClick={() => setExpandedId(expandedId === i ? null : i)}
            >
              <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0">
                {lender.priority}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a href={lender.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent-blue hover:underline" onClick={(e) => e.stopPropagation()}>
                    {lender.company}
                  </a>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${statusColors[lender.status]}`}>
                    {lender.status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{lender.type} | Target: {lender.facilityTarget}</p>
              </div>
              <div className="text-xs text-text-secondary">
                {lender.contacts.length} contact{lender.contacts.length !== 1 ? "s" : ""}
              </div>
              <svg className={`w-4 h-4 text-text-secondary transition-transform ${expandedId === i ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>

            {/* Expanded contacts */}
            {expandedId === i && (
              <div className="border-t border-border-custom px-4 py-3 bg-background">
                <div className="text-xs font-semibold text-text-secondary uppercase mb-3">Contacts (Outreach Order)</div>
                <div className="space-y-3">
                  {lender.contacts.map((contact, ci) => (
                    <div key={ci} className="flex items-start gap-3 p-3 bg-surface border border-border-custom rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green text-[10px] font-bold shrink-0 mt-0.5">
                        {ci + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{contact.name}</div>
                        <div className="text-xs text-text-secondary">{contact.title}</div>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          <a href={`mailto:${contact.email}`} className="text-xs text-accent-blue hover:underline">{contact.email}</a>
                          <span className="text-xs text-text-secondary">{contact.phone}</span>
                        </div>
                        {contact.notes && (
                          <p className="text-[11px] text-text-secondary mt-1.5 italic">{contact.notes}</p>
                        )}
                      </div>
                      <a
                        href={`mailto:${contact.email}?subject=Project%20Mosaic%20—%20${encodeURIComponent(lender.company)}%20Facility%20Inquiry&body=${encodeURIComponent(`Dear ${contact.name},\n\nI'm reaching out regarding a supply chain finance / factoring facility for a tile distribution business we are acquiring in Georgia.\n\nTarget facility: ${lender.facilityTarget}\nDeal size: $3.1M LBO\nAnnual revenue: $4.8M+ with 5% growth\n\nWould you be available for a brief call to discuss?\n\nBest regards,\nKeith Piper\nManaging Partner, Southern Precision Partners\ndeals@sep-partners.com`)}`}
                        className="shrink-0 bg-accent-blue text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-accent-blue/90 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Start Outreach
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
