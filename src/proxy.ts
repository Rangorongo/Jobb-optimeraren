import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PROTECTED_PATHS = ["/dashboard", "/onboarding"];

export default auth((req) => {
  const isProtected = PROTECTED_PATHS.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
