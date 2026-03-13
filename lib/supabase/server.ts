import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "env.mjs"

/**
 * Creates a Supabase client for server-side operations (Server Components, API Routes, Server Actions)
 *
 * This client uses Next.js cookies() API for session management and handles cookie operations
 * for authentication state persistence across requests.
 *
 * Requirements: 3.1, 3.2, 3.3
 *
 * @returns Promise<SupabaseClient> - Configured Supabase client instance
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Handle cookie setting errors in middleware
          // Errors can occur when trying to set cookies in contexts where it's not allowed
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch {
          // Handle cookie removal errors
          // Errors can occur when trying to remove cookies in contexts where it's not allowed
        }
      },
    },
  })
}
