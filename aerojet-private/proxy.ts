import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role

  // ── Admin — ADMIN only ─────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // ── Dashboard — auth required ──────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    // Broker + Admin only sections
    const brokerOnly = ['/dashboard/quotes', '/dashboard/operators', '/dashboard/analytics']
    if (brokerOnly.some(p => pathname.startsWith(p))) {
      if (role !== 'BROKER' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  // ── Profile — auth required ────────────────────────────────
  if (pathname.startsWith('/profile') && !session) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/profile', req.url))
  }

  // ── Redirect logged-in users from auth pages ───────────────
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*', '/login', '/register', '/verify'],
}
