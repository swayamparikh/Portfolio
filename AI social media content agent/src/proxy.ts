import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);
  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!isLoggedIn && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
