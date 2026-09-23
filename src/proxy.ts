import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { demoUsers } from "./lib/seed-data";

// Next.js 16 renamed middleware.ts -> proxy.ts (behavior is unchanged). Role comes from the
// df_uid demo-session cookie set by the login page; see lib/store.tsx for the full auth story
// (there's no real backend session yet — see CLAUDE.md env vars for what's still unconfigured).
export function proxy(request: NextRequest) {
  const uid = request.cookies.get("df_uid")?.value;
  const user = demoUsers.find((u) => u.id === uid);
  const { pathname } = request.nextUrl;

  const requiredRole = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/delivery")
      ? "DELIVERY"
      : pathname.startsWith("/dashboard")
        ? null // any logged-in user
        : undefined;

  if (requiredRole === undefined) return NextResponse.next();
  if (!user) return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
  if (requiredRole && user.role !== requiredRole) return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/delivery/:path*", "/dashboard/:path*"],
};
