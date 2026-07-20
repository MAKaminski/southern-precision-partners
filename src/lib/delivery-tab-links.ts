// Maps a delivery_tasks.system value to the platform tab that tracks that
// same work, so the delivery plan is auditable — click through and see the
// live thing being built, not just a text label. `system` is free text
// (editable per task), so this only covers the values actually in use;
// anything else (e.g. Bank, ERP, POS, Facility, Process, Web, Customer
// Portal) refers to a real-world operating-company system this platform
// doesn't have a tab for, and correctly shows no link rather than a
// misleading one.
export interface TabLink {
  href: string;
  label: string;
}

const SYSTEM_TAB_MAP: Record<string, TabLink> = {
  crm: { href: "/customers", label: "Customers" },
  erd: { href: "/erd", label: "ERD" },
  finance: { href: "/forecast", label: "Forecast" },
  gl: { href: "/forecast", label: "Forecast" },
  hris: { href: "/hr", label: "HR & Payroll" },
  marketing: { href: "/marketing", label: "Marketing & Growth" },
};

export function deliveryTabLink(system: string | null | undefined): TabLink | null {
  if (!system) return null;
  return SYSTEM_TAB_MAP[system.trim().toLowerCase()] ?? null;
}
