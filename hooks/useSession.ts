"use client"

import { useAuth } from "lib/contexts/auth-context"

export type SessionStatus = "loading" | "authenticated" | "unauthenticated"

/**
 * Derives session state from AuthProvider context.
 *
 * This avoids creating a separate Supabase client instance and duplicate
 * auth.getUser() / onAuthStateChange() calls that compete for the
 * Navigator LockManager lock.
 */
export function useSession() {
  const { user, loading } = useAuth()

  const status: SessionStatus = loading ? "loading" : user ? "authenticated" : "unauthenticated"

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  }
}
