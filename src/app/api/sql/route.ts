import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

const ROW_LIMIT = 500;

/**
 * POST { query } — run a read-only, single-statement SQL query via
 * run_readonly_query() (supabase/migrations/0009_readonly_sql_console_function.sql).
 * That function enforces read-only at the Postgres engine level
 * (transaction_read_only), not by string-blocklisting — this route only
 * adds clearance and basic input shape checks.
 */
export async function POST(req: NextRequest) {
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const query = body.query?.trim();
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const { data, error } = await db.rpc("run_readonly_query", { query_text: query, row_limit: ROW_LIMIT });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = (data ?? []) as Record<string, unknown>[];
  return NextResponse.json({ ok: true, rows, rowCount: rows.length, limited: rows.length === ROW_LIMIT });
}
