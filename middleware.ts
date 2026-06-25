import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
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
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const awc = request.nextUrl.searchParams.get('awc')
  const response = NextResponse.next()

  if (awc) {
    const hostname = request.nextUrl.hostname
    const cookieDomain =
      hostname === 'simplymot.co.uk' || hostname.endsWith('.simplymot.co.uk')
        ? '.simplymot.co.uk'
        : undefined

    // Not httpOnly: Awin Master Tag (dwin1.com) must read click ref from first-party cookie.
    response.cookies.set('awc', awc, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      domain: cookieDomain,
    })
  }

  // Check if it's a public route
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return response
  }

  // For protected routes (driver, garage, admin), let the client-side layout handle authentication
  // The middleware will allow the request to pass through
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


