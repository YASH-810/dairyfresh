import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "./lib/firebase/admin";

// Next.js 16 renamed middleware.ts -> proxy.ts and runs it on Node, so firebase-admin works here.
// Role comes from the verified Firebase session cookie's custom claim, never from the client.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = pathname.startsWith("/admin") ? "ADMIN" : pathname.startsWith("/delivery") ? "DELIVERY" : null;

  let role: unknown;
  try {
    const cookie = request.cookies.get("__session")?.value;
    if (cookie) role = (await adminAuth().verifySessionCookie(cookie)).role;
  } catch {
    // invalid / expired cookie -> treated as logged out
  }

  if (!role) {
    const loginTarget = pathname.startsWith("/delivery")
      ? "/login/delivery"
      : pathname.startsWith("/admin")
      ? "/login?role=ADMIN"
      : "/login";
    return NextResponse.redirect(new URL(`${loginTarget}?next=${pathname}`, request.url));
  }

  // delivery staff have no customer dashboard; their home is the route page
  if (role === "DELIVERY" && pathname.startsWith("/dashboard")) return NextResponse.redirect(new URL("/delivery", request.url));
  if (requiredRole && role !== requiredRole) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/delivery/:path*", "/dashboard/:path*"],
};
