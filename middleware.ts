import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

function getRequestOrigin(req: Request, fallbackUrl: URL) {
  const forwardedHost = req.headers.get("x-forwarded-host")
  const host = forwardedHost || req.headers.get("host") || fallbackUrl.host
  const forwardedProto = req.headers.get("x-forwarded-proto") || fallbackUrl.protocol.replace(":", "") || "https"
  return `${forwardedProto}://${host}`
}

function redirectTo(req: Request, path: string, fallbackUrl: URL) {
  return NextResponse.redirect(new URL(path, getRequestOrigin(req, fallbackUrl)))
}

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/", "/search", "/booking", "/login", "/register", "/terms", "/privacy"].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/api/webhooks")
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname)

  if (isApiAuthRoute) return NextResponse.next()

  if (isAuthRoute) {
    if (isLoggedIn) {
      return redirectTo(req, "/dashboard", nextUrl)
    }
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return redirectTo(req, `/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
  }

  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
