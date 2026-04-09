import { auth } from "@/auth";
import { NextResponse } from "next/server";

// All deal-related pages require authentication
const protectedPaths = ["/deals", "/details", "/crm", "/outreach", "/map", "/import"];
// Always public
const publicPaths = ["/", "/about", "/submit", "/auth/signin", "/api"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

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
