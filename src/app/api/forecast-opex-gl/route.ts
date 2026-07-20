import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

/** PATCH { id, value } — update a single forecast_opex_gl cell. */
export async function PATCH(req: NextRequest) {
  // Forecast OpEx GL detail — SEP partners only.
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
  const value =
    body.value === null || body.value === undefined || Number.isNaN(Number(body.value))
      ? null
      : Number(body.value);

  const { data, error } = await db
    .from("forecast_opex_gl")
    .update({ value })
    .eq("id", body.id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, row: data });
}
