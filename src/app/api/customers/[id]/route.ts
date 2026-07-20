import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Customer records incl. PII — SEP partners only.
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: {
    alias?: string;
    notes?: string;
    segment?: string;
    email?: string | null;
    phone?: string | null;
    address_line1?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    primary_store?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.alias !== undefined) updates.alias = String(body.alias).slice(0, 200);
  if (body.notes !== undefined) updates.notes = String(body.notes).slice(0, 4000);
  if (body.segment !== undefined) {
    if (!["top", "mid", "tail"].includes(body.segment)) {
      return NextResponse.json({ error: "invalid segment" }, { status: 400 });
    }
    updates.segment = body.segment;
  }
  const TEXT_FIELDS = ["email", "phone", "address_line1", "city", "state", "zip", "primary_store"] as const;
  for (const field of TEXT_FIELDS) {
    const value = body[field];
    if (value !== undefined) {
      updates[field] = value === null ? null : String(value).trim().slice(0, 300) || null;
    }
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await db.from("customers").update(updates).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, customer: data });
}
