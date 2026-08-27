import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/login", "/register", "/api/auth"];

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;

  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: nextUrl.protocol === "https:",
  });

  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && nextUrl.pathname === "/login") {
    const role = token.role as string;
    const redirectTo = role === "PATIENT" ? "/portal" : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, nextUrl.origin));
  }

  // Role-based route protection
  if (token) {
    const role = token.role as string;
    const path = nextUrl.pathname;

    if (path.startsWith("/portal") && role !== "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }

    if (path.startsWith("/dashboard") && role === "PATIENT") {
      return NextResponse.redirect(new URL("/portal", nextUrl.origin));
    }

    if (path.startsWith("/dashboard/hospitals") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }

    if (
      path.startsWith("/dashboard/staff") &&
      !["SUPER_ADMIN", "HOSPITAL_ADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }

    if (
      path.startsWith("/dashboard/audit-logs") &&
      !["SUPER_ADMIN", "HOSPITAL_ADMIN"].includes(role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
