// ─────────────────────────────────────────────────────────────────────────────
// Data & page classification / access-control policy
//
// Single source of truth for splitting the platform into PUBLIC vs PRIVATE.
// Every page, API route, and sensitive data payload is labelled with a
// Classification. A user's role determines their clearance; a request is only
// allowed when the user's clearance meets or exceeds the target's classification.
//
// This module is intentionally framework-agnostic (no next-auth / node imports)
// so it can run safely in the Edge middleware, in server route handlers, and in
// client components alike.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserRole } from "@/auth";

// Highest → lowest sensitivity.
export type Classification = "public" | "confidential" | "internal";

// A viewer is either anonymous (null) or an authenticated role.
export type Clearance = UserRole | null;

// Numeric clearance ladder. A viewer may access a resource when their rank is
// >= the resource's required rank.
const CLASSIFICATION_RANK: Record<Classification, number> = {
  public: 0,
  confidential: 1,
  internal: 2,
};

// TEMPORARY (2026-07-20): investor == partner while Google OAuth sign-in is
// broken (account-picker bug still unresolved) — real partners aren't
// reliably able to reach the "partner" role, so investor is granted full
// partner-level clearance (incl. internal ops tooling: CRM, outreach,
// delivery, forecast) so authorized people aren't locked out. Revert
// `investor` to 1 once Google sign-in is confirmed fixed — see ROADMAP.md.
const ROLE_RANK: Record<UserRole, number> = {
  investor: 2, // external SEP partners / prospective investors — deal materials
  partner: 2, // SEP internal staff — everything, incl. internal ops tooling
};

/** Rank of a viewer's clearance; anonymous visitors are 0 (public only). */
export function clearanceRank(role: Clearance): number {
  return role ? ROLE_RANK[role] : 0;
}

/** True when a viewer with `role` may access a resource of `level`. */
export function hasClearance(role: Clearance, level: Classification): boolean {
  return clearanceRank(role) >= CLASSIFICATION_RANK[level];
}

// Human-facing metadata for each tier — used by the ClassificationBadge and
// access-denied surfaces so labels stay consistent everywhere.
export const CLASSIFICATION_META: Record<
  Classification,
  { label: string; short: string; audience: string; badgeClass: string; description: string }
> = {
  public: {
    label: "Public",
    short: "PUBLIC",
    audience: "Anyone",
    badgeClass: "bg-accent-green/10 text-accent-green border-accent-green/20",
    description: "General information. Safe for public, non-authenticated visitors.",
  },
  confidential: {
    label: "Confidential — Investors",
    short: "CONFIDENTIAL",
    audience: "Authorized investors & partners",
    badgeClass: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    description:
      "Confidential deal materials. Restricted to signed-in, authorized investors and partners.",
  },
  internal: {
    label: "Internal — SEP Only",
    short: "INTERNAL",
    audience: "SEP partners / staff",
    badgeClass: "bg-accent-red/10 text-accent-red border-accent-red/20",
    description:
      "Internal operations data (CRM, outreach, contact PII). Restricted to SEP partners only.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Route → classification map. Prefix-matched, most-specific-wins. Anything not
// listed defaults to `public` (home, /about, /submit, /auth, static assets).
// ─────────────────────────────────────────────────────────────────────────────
type RouteRule = { prefix: string; level: Classification };

export const ROUTE_RULES: RouteRule[] = [
  // ── Confidential: investor-facing deal materials ──
  { prefix: "/deals", level: "confidential" },
  { prefix: "/details", level: "confidential" },
  { prefix: "/api/download-model", level: "confidential" },

  // ── Internal: SEP operations & contact PII ──
  { prefix: "/crm", level: "internal" },
  { prefix: "/outreach", level: "internal" },
  { prefix: "/map", level: "internal" },
  { prefix: "/import", level: "internal" },
  { prefix: "/customers", level: "internal" }, // customer records incl. PII / aliases / notes
  { prefix: "/delivery", level: "internal" }, // delivery plan / execution tracking — partner-only
  { prefix: "/forecast", level: "internal" }, // forecast P&L model — partner-only
  { prefix: "/api/contacts", level: "internal" },
  { prefix: "/api/import-contacts", level: "internal" },
  { prefix: "/api/customers", level: "internal" },
  { prefix: "/api/delivery", level: "internal" },
  { prefix: "/api/forecast", level: "internal" },

  // ── Explicitly public API surfaces ──
  { prefix: "/api/submit-deal", level: "public" }, // inbound deal submissions
  { prefix: "/api/chat", level: "public" }, // guarded at the response layer, not the route
  { prefix: "/api/auth", level: "public" }, // NextAuth handlers
];

/** Classify a pathname. Longest matching prefix wins; unlisted → public. */
export function classifyPath(pathname: string): Classification {
  let best: RouteRule | null = null;
  for (const rule of ROUTE_RULES) {
    const matches = pathname === rule.prefix || pathname.startsWith(rule.prefix + "/");
    if (matches && (!best || rule.prefix.length > best.prefix.length)) {
      best = rule;
    }
  }
  return best ? best.level : "public";
}
