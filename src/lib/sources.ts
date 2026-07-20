// ─── Sourcing / auditability registry ────────────────────────────────────────
// Single source of truth for *who asked for what*. Every report (src/lib/
// reports.ts) and every changelog entry (src/lib/changelog.ts) references a
// source by id, so any addition to the platform can be traced back to the
// party that requested it, the channel it came in on, and the date.
//
// When you add a section, report, or tab at someone's request, register the
// request here first and attribute the work to its `id`. That keeps the
// provenance verifiable rather than tribal knowledge.

export interface SourceExcerpt {
  /** Short label for this specific ask. */
  heading: string;
  /** The requester's own words, quoted as faithfully as practical. */
  text: string;
}

export interface FeedbackSource {
  /** Stable id referenced by reports.ts and changelog.ts. */
  id: string;
  /** Who the feedback came from. */
  party: string;
  /** Their role / relationship to the deal. */
  role: string;
  /** How it arrived, e.g. "Email — 'Mosaic - BI Input'". */
  channel: string;
  /** ISO date the input was received. */
  receivedAt: string;
  /** Subject line / document title, when there is one. */
  subject?: string;
  /** One-line summary of the request. */
  summary: string;
  /** The requester's verbatim asks, itemised. */
  excerpts: SourceExcerpt[];
  /** Anything in the same message that is not a BI/report request. */
  otherNotes?: string[];
}

// ── Keith Piper — BI requirements (2026-07-20) ───────────────────────────────
// Received by email, subject "Mosaic - BI Input", documenting the BI/reporting
// requirements Keith wants the platform to deliver. Reproduced verbatim so the
// reports and changelog built from it can be audited against the original ask.
export const keithBiInput: FeedbackSource = {
  id: "keith-bi-input-2026-07-20",
  party: "Keith Piper",
  role: "Managing Partner (JP) — Project Mosaic",
  channel: "Email — “Mosaic - BI Input”",
  receivedAt: "2026-07-20",
  subject: "Mosaic - BI Input",
  summary:
    "BI requirements for the KPI dashboards — mix rate, customer trend, attachment %, P&L themes, per-associate KPIs, AI theme detection, and discretionary-discount visibility, distilled into a 15–30 min Monday all-hands.",
  excerpts: [
    {
      heading: "Mix Rate",
      text:
        "Identify product portfolio mix impact to GM% in bps YoY. Also identify YoY rate impact for like items to understand how we are absorbing cost changes.",
    },
    {
      heading: "Customer trend",
      text:
        "Identify customer and type that are positively impacting or detracting from performance. This will help identify levers such as upselling for DIY, driving attach for full project needs for pros. Maybe we need to target a different demographic based on changing macro backdrop?",
    },
    {
      heading: "Attachment %",
      text:
        "We need to identify our core items and our attach items to identify how we are addressing customer needs. Are we being price shopped by item or are we a destination for all addressable tile system needs for pro/diy?",
    },
    {
      heading: "P&L high-level themes",
      text:
        "P&L high level themes impacting P&L so we can keep our employees aware of what is pertinent to their role.",
    },
    {
      heading: "Per-associate KPI achievement",
      text:
        "We should be able to identify full P&L impact with YoY sales, GM% vLY, % of orders tied to customer account by associate so we can measure KPI achievement for each individual.",
    },
    {
      heading: "AI theme detection",
      text:
        "AI should help identify key themes to capture what a weekly report run iteratively may miss.",
    },
    {
      heading: "Discretionary discounts",
      text:
        "Discretionary discounts — want visibility to this because we should create a favorable economic offer for our customers without need to discount once our productivity initiatives are completed.",
    },
    {
      heading: "Weekly all-hands digest",
      text:
        "The goal would be to boil key themes into a weekly all-hands meeting that shouldn't be more than 15–30 minutes on a Monday morning. Check in with our associates and ensure alignment on the key operating activities for the week. Celebrate wins and reiterate what each associate is doing to impact our business results (use real numbers).",
    },
  ],
  otherNotes: [
    "Follow-up (non-BI): take the partnership document to legal — but hold until we align on an offer the bank can underwrite, to save expense.",
  ],
};

export const SOURCES: FeedbackSource[] = [keithBiInput];

export function getSource(id: string): FeedbackSource | undefined {
  return SOURCES.find((s) => s.id === id);
}

/** Compact attribution string, e.g. for tooltips / one-line credits. */
export function sourceCredit(id: string): string {
  const s = getSource(id);
  if (!s) return "Source unknown";
  return `Requested by ${s.party} · ${s.channel} · ${s.receivedAt}`;
}
