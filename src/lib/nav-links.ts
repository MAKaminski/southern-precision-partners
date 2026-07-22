import type { Classification } from "@/lib/access";

export interface NavLink {
  href: string;
  label: string;
  level: Classification;
}

// Shared between the logged-out top bar (MainNav) and the signed-in left
// sidebar (Sidebar) so the destination list only lives in one place.
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", level: "public" },
  { href: "/about", label: "About", level: "public" },
  { href: "/deals/mosaic", label: "Project Mosaic", level: "confidential" },
  { href: "/details", label: "Details", level: "confidential" },
  { href: "/summary", label: "Summary", level: "confidential" },
  { href: "/customers", label: "Customers", level: "internal" },
  { href: "/delivery", label: "Delivery Plan", level: "internal" },
  { href: "/jp-variance", label: "JP Requirements Δ", level: "internal" },
  { href: "/prospects", label: "Pro Prospects", level: "internal" },
  { href: "/reports", label: "Reports", level: "internal" },
  { href: "/changelog", label: "Changelog", level: "internal" },
  { href: "/forecast", label: "Forecast", level: "internal" },
  { href: "/hr", label: "HR & Payroll", level: "internal" },
  { href: "/marketing", label: "Marketing & Growth", level: "internal" },
  { href: "/crm", label: "CRM", level: "internal" },
  { href: "/outreach", label: "Outreach", level: "internal" },
  { href: "/map", label: "Map", level: "internal" },
  { href: "/import", label: "Import", level: "internal" },
  { href: "/erd", label: "ERD", level: "internal" },
  { href: "/sql", label: "SQL Console", level: "internal" },
  { href: "/systems", label: "Systems", level: "internal" },
  { href: "/submit", label: "Submit", level: "public" },
];
