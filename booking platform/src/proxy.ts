import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isHostRoute = pathname.startsWith("/host");
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isHostRoute || isAdminRoute) && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isHostRoute && role !== "host" && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/host/:path*", "/admin/:path*"],
};
