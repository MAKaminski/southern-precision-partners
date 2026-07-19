import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSppDb } from "@/lib/spp-db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: { alias?: string; notes?: string; segment?: string };
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
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await db.from("customers").update(updates).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, customer: data });
}
