import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token?.status === "SUSPENDED" && pathname !== "/suspended") {
      return NextResponse.redirect(new URL("/suspended", req.url));
    }

    if ((pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) && !token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
    }

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run the middleware above instead of auto-redirecting
      // unauthenticated users — most matched routes are public, and the
      // dashboard/admin login check is handled manually there.
      authorized: () => true,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
