import { auth } from "@/auth";
import { NextResponse } from "next/server";

// All deal-related pages require authentication
const protectedPaths = ["/deals", "/details", "/crm", "/outreach", "/map", "/import"];
// API routes backing those pages carry the same PII/financial data. The blanket
// "/api" public exemption below only clears the page-level gate, not these — they
// must independently require a session or they're reachable with no login at all.
const protectedApiPaths = ["/api/contacts", "/api/import-contacts", "/api/download-model"];
// Always public
const publicPaths = ["/", "/about", "/submit", "/auth/signin", "/api"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtectedApi = protectedApiPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isProtectedApi) {
    if (!req.auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Allow public pages, API routes, and static assets
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) && !pathname.startsWith("/deals")) {
    return NextResponse.next();
  }

  // Protect deal pages and internal tools — must be logged in
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
