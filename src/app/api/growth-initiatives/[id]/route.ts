import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

const ALLOWED_STATUS = ["tbd", "planned", "in_progress", "done"];

interface PatchBody {
  status?: string;
  owner?: string | null;
  notes?: string | null;
  target_revenue_impact?: number | null;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Marketing & growth planning data — SEP partners only.
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.owner !== undefined) {
    updates.owner = body.owner === null ? null : String(body.owner).trim().slice(0, 100) || null;
  }
  if (body.notes !== undefined) {
    updates.notes = body.notes === null ? null : String(body.notes).slice(0, 2000);
  }
  if (body.target_revenue_impact !== undefined) {
    const v = body.target_revenue_impact;
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v))) {
      return NextResponse.json({ error: "invalid target_revenue_impact" }, { status: 400 });
    }
    updates.target_revenue_impact = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await db.from("growth_initiatives").update(updates).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, initiative: data });
}
