import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

interface RevenueMatrixRow {
  id: string;
  year: number;
  existing_rev: number | null;
  new_rev: number | null;
  replacement: number | null;
  churn: number | null;
  ending_rev: number | null;
}

/**
 * PATCH { id, value } — edit the churn amount on one revenue_matrix row.
 *
 * Churn is a real driver, not an isolated cell: this recomputes that year's
 * ending_rev, then cascades existing_rev/ending_rev forward through every
 * later year (existing_rev[y+1] = ending_rev[y]) so the whole build-to-plan
 * stays internally consistent. Returns the full, re-cascaded matrix.
 */
export async function PATCH(req: NextRequest) {
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: { id?: string; value?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const churn =
    body.value === null || body.value === undefined || Number.isNaN(Number(body.value))
      ? null
      : Number(body.value);

  const { data: rows, error: fetchErr } = await db
    .from("revenue_matrix")
    .select("*")
    .order("year", { ascending: true });
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const matrix = (rows ?? []) as RevenueMatrixRow[];
  const targetIdx = matrix.findIndex((r) => r.id === body.id);
  if (targetIdx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });

  matrix[targetIdx] = { ...matrix[targetIdx], churn };
  const recompute = (r: RevenueMatrixRow) =>
    (r.existing_rev ?? 0) + (r.new_rev ?? 0) + (r.replacement ?? 0) + (r.churn ?? 0);
  matrix[targetIdx].ending_rev = recompute(matrix[targetIdx]);

  const changed = [matrix[targetIdx]];
  for (let i = targetIdx + 1; i < matrix.length; i++) {
    const prevEnding = matrix[i - 1].ending_rev;
    matrix[i] = { ...matrix[i], existing_rev: prevEnding };
    matrix[i].ending_rev = recompute(matrix[i]);
    changed.push(matrix[i]);
  }

  for (const row of changed) {
    const { error } = await db
      .from("revenue_matrix")
      .update({ churn: row.churn, existing_rev: row.existing_rev, ending_rev: row.ending_rev })
      .eq("id", row.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, revenueMatrix: matrix });
}
