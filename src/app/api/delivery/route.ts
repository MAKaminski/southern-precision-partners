import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";
import { normalizeDeliveryFields, type DeliveryFieldsBody } from "@/lib/delivery-fields";

// Create a delivery plan item. Same clearance as the inline edits — delivery
// plan / execution data is SEP partners only.
export async function POST(req: NextRequest) {
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

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

  const values = normalized.values;
  if (typeof values.title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // sort_order is a single sequence across the whole plan; appending puts the
  // new row at the bottom of whichever year group it belongs to.
  const { data: last, error: lastError } = await db
    .from("delivery_tasks")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return NextResponse.json({ error: lastError.message }, { status: 500 });

  const { data, error } = await db
    .from("delivery_tasks")
    .insert({ status: "not_started", ...values, sort_order: (last?.sort_order ?? 0) + 1 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, task: data }, { status: 201 });
}
