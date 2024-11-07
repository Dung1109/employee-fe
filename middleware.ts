import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const jwtCookie = request.cookies.get("jwt");
  const isAuthPage = request.nextUrl.pathname === "/login";

  // If no JWT and not on login page, redirect to login
  if (!jwtCookie?.value && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If has JWT and on login page, redirect to home
  if (jwtCookie?.value && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
