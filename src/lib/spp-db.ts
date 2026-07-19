import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for Southern Precision Partners operational data
 * (customers, AR, delivery plan, forecast). Uses the service-role key, which
 * BYPASSES row-level security — every table in the SPP schema is RLS-enabled
 * with no anon/authenticated policies (deny-by-default), so this client is the
 * single trusted read/write path. It must never be imported into a client
 * component; the `server-only` import guards against that at build time.
 *
 * Access is gated a second time at the app layer by next-auth middleware
 * (see src/middleware.ts), which protects every /delivery, /forecast and
 * /customers route.
 */
let _client: SupabaseClient | null = null;

export function getSppDb(): SupabaseClient | null {
  if (_client) return _client;
  // Accept both our own var names and the ones the Vercel↔Supabase integration
  // injects (unprefixed SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://yscxrvuwwfpjuciuawcv.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/** Thrown-on-missing variant for routes/pages that require the DB. */
export function requireSppDb(): SupabaseClient {
  const db = getSppDb();
  if (!db) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured — cannot reach the Southern Precision Partners database.",
    );
  }
  return db;
}
