// Field validation/normalisation shared by the delivery plan API routes.
// POST /api/delivery (create) and PATCH /api/delivery/[id] (inline edit) accept
// the same field set, so the rules live here once.

export const ALLOWED_STATUS = ["not_started", "in_progress", "blocked", "done"] as const;
export type DeliveryStatus = (typeof ALLOWED_STATUS)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface DeliveryFieldsBody {
  status?: string;
  notes?: string;
  title?: string;
  system?: string | null;
  next_step?: string | null;
  owner?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  cost_k?: number | null;
  benefit_k?: number | null;
  delivery_year?: number | null;
}

export type NormalizeResult =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; error: string };

const TEXT_FIELDS = [
  ["system", 50],
  ["next_step", 300],
  ["owner", 50],
] as const;

/**
 * Validate and trim the delivery-task fields present on `body`. Absent keys are
 * left out of the result entirely, so the same output works as a partial update
 * or as the column set for an insert.
 */
export function normalizeDeliveryFields(body: DeliveryFieldsBody): NormalizeResult {
  const values: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!(ALLOWED_STATUS as readonly string[]).includes(body.status)) {
      return { ok: false, error: "invalid status" };
    }
    values.status = body.status;
  }

  if (body.notes !== undefined) values.notes = String(body.notes).slice(0, 2000);

  if (body.title !== undefined) {
    const title = String(body.title).trim().slice(0, 300);
    if (!title) return { ok: false, error: "title cannot be empty" };
    values.title = title;
  }

  for (const [field, max] of TEXT_FIELDS) {
    const v = body[field];
    if (v !== undefined) values[field] = v === null ? null : String(v).trim().slice(0, max) || null;
  }

  for (const field of ["start_date", "end_date"] as const) {
    const v = body[field];
    if (v !== undefined) {
      if (v !== null && !DATE_RE.test(v)) {
        return { ok: false, error: `invalid ${field} (expected YYYY-MM-DD)` };
      }
      values[field] = v;
    }
  }

  for (const field of ["cost_k", "benefit_k"] as const) {
    const v = body[field];
    if (v !== undefined) {
      if (v !== null && (typeof v !== "number" || !Number.isFinite(v))) {
        return { ok: false, error: `invalid ${field}` };
      }
      values[field] = v;
    }
  }

  if (body.delivery_year !== undefined) {
    const v = body.delivery_year;
    if (v !== null && (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 20)) {
      return { ok: false, error: "invalid delivery_year" };
    }
    values.delivery_year = v;
  }

  return { ok: true, values };
}
