import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

const ALLOWED_STATUS = ["not_started", "in_progress", "blocked", "done"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface PatchBody {
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
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Delivery plan / execution data — SEP partners only.
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
  if (body.notes !== undefined) updates.notes = String(body.notes).slice(0, 2000);

  if (body.title !== undefined) {
    const title = String(body.title).trim().slice(0, 300);
    if (!title) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    updates.title = title;
  }
  if (body.system !== undefined) updates.system = body.system === null ? null : String(body.system).trim().slice(0, 50) || null;
  if (body.next_step !== undefined) updates.next_step = body.next_step === null ? null : String(body.next_step).trim().slice(0, 300) || null;
  if (body.owner !== undefined) updates.owner = body.owner === null ? null : String(body.owner).trim().slice(0, 50) || null;

  for (const field of ["start_date", "end_date"] as const) {
    const v = body[field];
    if (v !== undefined) {
      if (v !== null && !DATE_RE.test(v)) {
        return NextResponse.json({ error: `invalid ${field} (expected YYYY-MM-DD)` }, { status: 400 });
      }
      updates[field] = v;
    }
  }

  for (const field of ["cost_k", "benefit_k"] as const) {
    const v = body[field];
    if (v !== undefined) {
      if (v !== null && (typeof v !== "number" || !Number.isFinite(v))) {
        return NextResponse.json({ error: `invalid ${field}` }, { status: 400 });
      }
      updates[field] = v;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await db.from("delivery_tasks").update(updates).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, task: data });
}
