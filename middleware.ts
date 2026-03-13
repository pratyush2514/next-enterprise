import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { createClient } from "./lib/supabase/middleware"

const intlMiddleware = createIntlMiddleware(routing)

/** Auth-only pages — redirect authenticated users to /song */
const AUTH_PAGES = ["/login", "/signup"]

/** Protected pages — redirect unauthenticated users to /login */
const PROTECTED_PAGES = ["/profile"]

/** Delete all Supabase auth cookies from a response so the browser stops sending them. */
function clearAuthCookies(request: NextRequest, res: NextResponse) {
  request.cookies
    .getAll()
    .filter((c) => c.name.startsWith("sb-"))
    .forEach((c) => {
      res.cookies.set(c.name, "", { maxAge: 0, path: "/" })
    })
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for API routes, auth callback, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Strip locale prefix to check the path
  const pathWithoutLocale = pathname.replace(/^\/(en|nl)/, "") || "/"

  const isAuthPage = AUTH_PAGES.some((page) => pathWithoutLocale === page)
  const isProtectedPage = PROTECTED_PAGES.some((route) => pathWithoutLocale.startsWith(route))

  // Pages that don't need auth — run intl middleware directly (no Supabase calls)
  if (!isAuthPage && !isProtectedPage) {
    return intlMiddleware(request)
  }

  // Quick check: no auth cookies → definitely unauthenticated, skip Supabase
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"))

  if (!hasAuthCookie) {
    if (isProtectedPage) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathWithoutLocale)
      return NextResponse.redirect(loginUrl)
    }
    return intlMiddleware(request)
  }

  // Has auth cookies — validate session with Supabase
  const { supabase, response } = await createClient(request)

  let user = null
  try {
    const getUserPromise = supabase.auth.getUser().catch(() => null)
    const result = await Promise.race([
      getUserPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ])
    if (result && typeof result === "object" && "data" in result) {
      user = (result as { data: { user: unknown } }).data.user
    }
  } catch {
    // Supabase unreachable — treat as unauthenticated
  }

  // Auth failed with stale cookies → clear them so future requests skip Supabase
  if (!user) {
    if (isProtectedPage) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathWithoutLocale)
      const redirectRes = NextResponse.redirect(loginUrl)
      clearAuthCookies(request, redirectRes)
      return redirectRes
    }
    const intlRes = intlMiddleware(request)
    clearAuthCookies(request, intlRes)
    return intlRes
  }

  // Authenticated user on auth page → redirect to /song
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/song", request.url))
  }

  // Authenticated on protected page — merge Supabase cookies and continue
  const intlResponse = intlMiddleware(request)
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie)
  })
  return intlResponse
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
