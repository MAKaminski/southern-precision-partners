// Server-only clearance guard for API route handlers. Provides defense-in-depth:
// even though middleware already gates these routes, each sensitive handler
// re-checks clearance so the data can never be served if a route is ever
// reached directly (e.g. matcher change, internal fetch, misconfiguration).

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasClearance, type Classification, type Clearance } from "@/lib/access";

interface SessionLike {
  user?: unknown;
  role?: Clearance;
}

/**
 * Resolve the current viewer's role from the session (null if anonymous).
 */
export async function currentClearance(): Promise<Clearance> {
  const session = (await auth()) as SessionLike | null;
  if (!session?.user) return null;
  return session.role ?? "investor";
}

/**
 * Enforce a classification on an API request.
 *
 * Returns `{ ok: true, role }` when the viewer is authorized, or
 * `{ ok: false, response }` with a ready-to-return 401/403 JSON response.
 */
export async function requireClearance(
  level: Classification
): Promise<{ ok: true; role: Clearance } | { ok: false; response: NextResponse }> {
  const role = await currentClearance();

  if (hasClearance(role, level)) {
    return { ok: true, role };
  }

  const status = role ? 403 : 401;
  const message = role
    ? "You do not have clearance to access this resource."
    : "Authentication required. Please sign in to access this resource.";

  return {
    ok: false,
    response: NextResponse.json({ success: false, error: message, classification: level }, { status }),
  };
}
