import { createBrowserClient } from "@supabase/ssr"

import { env } from "env.mjs"

let client: ReturnType<typeof createBrowserClient> | null = null

/**
 * A fetch wrapper that converts network errors (thrown when Supabase is
 * unreachable) into 401 responses. Using 4xx avoids the SDK's retry loop
 * that triggers on 5xx status codes.
 */
const resilientFetch: typeof globalThis.fetch = async (input, init) => {
  try {
    return await globalThis.fetch(input, init)
  } catch {
    return new Response(JSON.stringify({ error: "network_error", error_description: "Supabase is unreachable" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
}

/**
 * Returns a singleton Supabase client for client-side operations.
 *
 * Using a singleton avoids creating multiple client instances that compete
 * for the same Navigator LockManager lock on the auth token, which causes
 * "lock timed out" errors.
 */
export function createClient() {
  if (client) return client

  client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch: resilientFetch },
  })
  return client
}
