import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed middleware.ts -> proxy.ts. Mock auth: role comes from the df_role cookie the
// login page sets (see lib/store.tsx) — fine for the demo, not real security.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("df_role")?.value;
  const requiredRole = pathname.startsWith("/admin") ? "ADMIN" : pathname.startsWith("/delivery") ? "DELIVERY" : null;

  if (!role) {
    const loginTarget = pathname.startsWith("/delivery")
      ? "/login/delivery"
      : pathname.startsWith("/admin")
      ? "/login?role=ADMIN"
      : "/login";
    const url = new URL(loginTarget, request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // delivery staff have no customer dashboard; their home is the route page
  if (role === "DELIVERY" && pathname.startsWith("/dashboard")) return NextResponse.redirect(new URL("/delivery", request.url));
  if (requiredRole && role !== requiredRole) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/delivery/:path*", "/dashboard/:path*"],
};
