import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

const ALLOWED_FIELDS = ["plan_value", "actual_value", "notes"];

/** PATCH { id, field, value } — update a single monthly_performance cell. */
export async function PATCH(req: NextRequest) {
  // Investor-facing monthly performance data — SEP partners only (source of the Summary page investors see).
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: { id?: string; field?: string; value?: number | string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!body.field || !ALLOWED_FIELDS.includes(body.field)) {
    return NextResponse.json({ error: "invalid field" }, { status: 400 });
  }

  let value: number | string | null;
  if (body.field === "notes") {
    value = body.value === null || body.value === undefined ? null : String(body.value).slice(0, 500);
  } else {
    value =
      body.value === null || body.value === undefined || Number.isNaN(Number(body.value))
        ? null
        : Number(body.value);
  }

  const { data, error } = await db
    .from("monthly_performance")
    .update({ [body.field]: value })
    .eq("id", body.id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, row: data });
}
