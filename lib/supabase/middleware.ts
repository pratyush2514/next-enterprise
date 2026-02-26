import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { env } from "env.mjs"

export async function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch: async (input, init) => {
        try {
          return await fetch(input, init)
        } catch {
          // Return 401 so the SDK treats it as a non-retryable auth
          // error (4xx) instead of retrying endlessly on 5xx.
          return new Response(
            JSON.stringify({ error: "network_error", error_description: "Supabase is unreachable" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          )
        }
      },
    },
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value: "",
          ...options,
        })
      },
    },
  })

  return { supabase, response }
}
