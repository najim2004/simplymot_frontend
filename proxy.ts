import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  '/',
  '/login',
  '/login/driver',
  '/login/garage',
  '/admin-login',
  '/create-account',
  '/create-account/driver',
  '/create-account/garage',
  '/create-account/pricing',
  '/forgot-password',
  '/contact-us',
  '/cookies-policy',
  '/privacy-policy',
  '/terms-drivers',
  '/terms-garages',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const awc = request.nextUrl.searchParams.get('awc');
  const response = NextResponse.next();

  if (awc) {
    const hostname = request.nextUrl.hostname;
    const cookieDomain =
      hostname === 'simplymot.co.uk' || hostname.endsWith('.simplymot.co.uk')
        ? '.simplymot.co.uk'
        : undefined;

    response.cookies.set('awc', awc, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      domain: cookieDomain,
    });
  }

  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
