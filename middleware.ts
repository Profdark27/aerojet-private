import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PRODUCTION_ORIGIN = "https://aerojet-private.vercel.app"

function getSafeOrigin(req: Request, fallbackUrl: URL) {
  const forwardedHost = req.headers.get("x-forwarded-host")
  const host = forwardedHost || req.headers.get("host") || fallbackUrl.host
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https"

  if (host === "aerojet-private.vercel.app") {
    return `${forwardedProto}://${host}`
  }

  if (host.endsWith(".vercel.app") && !host.includes("aerojet.app")) {
    return `${forwardedProto}://${host}`
  }

  return PRODUCTION_ORIGIN
}

function safeCallbackUrl(pathname: string, search: string) {
  const callbackUrl = `${pathname}${search || ""}`
  return callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard"
}

function redirectTo(req: Request, path: string, fallbackUrl: URL) {
  return NextResponse.redirect(new URL(path, getSafeOrigin(req, fallbackUrl)))
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
    const encodedCallbackUrl = encodeURIComponent(safeCallbackUrl(nextUrl.pathname, nextUrl.search))
    return redirectTo(req, `/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
