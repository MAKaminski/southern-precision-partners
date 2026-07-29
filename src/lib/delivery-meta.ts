// Shared display metadata for the delivery plan, used by both the table and
// the add-item form so labels can never drift between the two.

export const DELIVERY_YEAR_LABEL: Record<number, string> = {
  1: "Year 1 — Integration & Foundation (2026)",
  2: "Year 2 — Revenue Acceleration (2027)",
  3: "Year 3 — Scale & Expansion (2028)",
  4: "Year 4 — Platform & Portals (2029)",
  5: "Year 5 — Optimize & Exit (2030–31)",
};

export const DELIVERY_YEARS = [1, 2, 3, 4, 5];

export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export function deliveryYearLabel(year: number): string {
  return DELIVERY_YEAR_LABEL[year] ?? `Year ${year}`;
}
