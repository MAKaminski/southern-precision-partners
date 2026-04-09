import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Pages that require authentication
const protectedPaths = ["/details", "/crm", "/outreach", "/map"];
// Pages that are always public
const publicPaths = ["/", "/submit", "/auth/signin", "/api"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public paths and API routes
  if (publicPaths.some((p) => pathname.startsWith(p)) || pathname === "/") {
    return NextResponse.next();
  }

  // Check if path is protected
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
