import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

const AUTH_PAGES = ["/login", "/signup"]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip intl middleware for NextAuth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Run intl middleware first (handles locale routing)
  const response = intlMiddleware(request)

  // Check if an authenticated user is trying to access auth pages
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value || request.cookies.get("__Secure-authjs.session-token")?.value

  if (sessionToken) {
    // Strip locale prefix to check the path
    const pathWithoutLocale = pathname.replace(/^\/(en|nl)/, "") || "/"

    if (AUTH_PAGES.some((page) => pathWithoutLocale === page)) {
      const catalogUrl = new URL("/catalog", request.url)
      return NextResponse.redirect(catalogUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
