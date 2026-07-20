import { NextResponse } from "next/server";

// Public, unauthenticated status endpoint. Reports presence (never values) of
// required runtime configuration so a misconfigured deployment — e.g. a
// missing AUTH_SECRET, which broke all sign-in from 2026-04-09 to at least
// 2026-07-19 without anyone noticing — surfaces in one request instead of
// needing someone to go dig through provider error logs.
export async function GET() {
  const checks = {
    authSecret: Boolean(process.env.AUTH_SECRET),
    googleOAuth: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    supabase: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL),
    anthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
  };

  // Sign-in and the access-control fail-closed guarantee both depend on
  // AUTH_SECRET; Supabase-backed CRM/delivery/forecast pages depend on the
  // service role key. Google OAuth and the chatbot degrade gracefully
  // without their keys, so they're reported but don't flip overall health.
  const ok = checks.authSecret && checks.supabase;

  return NextResponse.json(
    { ok, checks, timestamp: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}
