import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const awc = request.nextUrl.searchParams.get("awc");

  const token = request.cookies.get("access_token")?.value;
  const userKind = request.cookies.get("user_kind")?.value?.toUpperCase();

  // Allow public access to book-my-mot routes
  if (pathname.startsWith("/driver/book-my-mot")) {
    const response = NextResponse.next();
    if (awc) {
      setAwcCookie(request, response, awc);
    }
    return response;
  }

  // Driver dashboard routes protection
  if (pathname.startsWith("/driver")) {
    if (!token || (userKind !== "DRIVER" && userKind !== "USER")) {
      return NextResponse.redirect(new URL("/login/driver", request.url));
    }
  }

  // Garage dashboard routes protection
  if (pathname.startsWith("/garage")) {
    if (!token || userKind !== "GARAGE") {
      return NextResponse.redirect(new URL("/login/garage", request.url));
    }
  }

  // Admin dashboard routes protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    if (!token || userKind !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  const response = NextResponse.next();
  if (awc) {
    setAwcCookie(request, response, awc);
  }
  return response;
}

function setAwcCookie(
  request: NextRequest,
  response: NextResponse,
  awc: string,
) {
  const hostname = request.nextUrl.hostname;
  const cookieDomain =
    hostname === "simplymot.co.uk" || hostname.endsWith(".simplymot.co.uk")
      ? ".simplymot.co.uk"
      : undefined;

  response.cookies.set("awc", awc, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    domain: cookieDomain,
  });
}

export const config = {
  matcher: [
    "/driver",
    "/driver/:path*",
    "/garage",
    "/garage/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
