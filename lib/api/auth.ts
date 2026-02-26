import { type User } from "@supabase/supabase-js"

import { createClient } from "lib/supabase/server"

/**
 * Validates the current request has an authenticated user.
 * Uses Supabase server client to check the session.
 *
 * @returns Object with user data if authenticated, or error message
 */
export async function requireAuth(): Promise<{ user: User | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: "Unauthorized" }
  }

  return { user, error: null }
}

/**
 * Higher-order function that wraps an API handler with authentication.
 * Returns 401 if the user is not authenticated.
 *
 * @param handler - Async function that receives the authenticated user
 * @returns Handler result or 401 Response
 */
export async function withAuth<T>(handler: (user: User) => Promise<T>): Promise<T | Response> {
  const { user, error } = await requireAuth()

  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  return handler(user)
}
