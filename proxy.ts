import { type NextRequest, NextResponse } from "next/server";
import { homeFor, isRole, isStaff, SESSION_COOKIE } from "@/lib/auth/roles";

/**
 * Demo route guard. Reads the role cookie set at sign-in and redirects
 * before render: /dashboard is staff-only, /portal is client-only, and a
 * signed-in user visiting /login goes to their own home.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const role = isRole(cookie) ? cookie : null;
  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/login") {
    return role ? redirect(homeFor(role)) : NextResponse.next();
  }

  const wantsDashboard = pathname.startsWith("/dashboard");
  if (!role) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return redirect(`/login?next=${next}`);
  }
  if (wantsDashboard && !isStaff(role)) return redirect("/portal");
  if (!wantsDashboard && isStaff(role)) return redirect("/dashboard");
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/portal/:path*"],
};
