import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { classifyPath, hasClearance, type Clearance } from "@/lib/access";

// Central guardrail: classify every incoming request and enforce the clearance
// required for its classification. Splits the platform into public vs private —
// anonymous visitors reach only `public` resources; `confidential` requires an
// authenticated investor/partner; `internal` requires a partner.
export default auth((req) => {
  const { pathname } = req.nextUrl;

  const level = classifyPath(pathname);

  // Public resources are always allowed.
  if (level === "public") {
    return NextResponse.next();
  }

  // Role is carried on the session (see auth.ts session callback).
  const role = (req.auth as { role?: Clearance } | null)?.role ?? (req.auth ? "investor" : null);

  if (hasClearance(role, level)) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api");

  // API routes: respond with machine-readable 401/403 instead of an HTML redirect.
  if (isApi) {
    const status = req.auth ? 403 : 401;
    return NextResponse.json(
      {
        success: false,
        error: req.auth
          ? "You do not have clearance to access this resource."
          : "Authentication required.",
        classification: level,
      },
      { status }
    );
  }

  // Pages: not signed in → sign-in; signed in but under-cleared → unauthorized.
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const deniedUrl = new URL("/unauthorized", req.url);
  deniedUrl.searchParams.set("from", pathname);
  deniedUrl.searchParams.set("level", level);
  return NextResponse.redirect(deniedUrl);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
