import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge middleware — protects /dashboard/* and /profile/* routes.
 * Redirects unauthenticated users to /login with callbackUrl.
 * Does NOT use Prisma (edge-compatible).
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes that require authentication
  const protectedPrefixes = ['/dashboard', '/profile', '/trip']

  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix))
  if (!isProtected) return NextResponse.next()

  // Check session via NextAuth
  const session = await auth()

  if (!session?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Match protected pages only (skip API, static files, etc.)
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/trip/:path*',
  ],
}
