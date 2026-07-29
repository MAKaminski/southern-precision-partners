import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";
import { normalizeDeliveryFields, type DeliveryFieldsBody } from "@/lib/delivery-fields";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Delivery plan / execution data — SEP partners only.
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: DeliveryFieldsBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const normalized = normalizeDeliveryFields(body);
  if (!normalized.ok) return NextResponse.json({ error: normalized.error }, { status: 400 });

  const updates = normalized.values;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await db.from("delivery_tasks").update(updates).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, task: data });
}
