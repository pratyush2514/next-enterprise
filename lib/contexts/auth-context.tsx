"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { type User } from "@supabase/supabase-js"

import { createClient } from "lib/supabase/client"
import { type Profile } from "types/auth"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use a ref for the singleton client so it's stable across renders
  const supabaseRef = useRef(createClient())
  // Guard against stale profile fetches when auth state changes rapidly
  const profileFetchIdRef = useRef(0)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: profileError } = await supabaseRef.current
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (profileError) {
        setError(profileError)
        return null
      }

      return data
    } catch {
      // Network error — Supabase unreachable, treat as no profile
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const profileData = await fetchProfile(user.id)
    if (profileData) {
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      await supabaseRef.current.auth.signOut()
    } catch {
      // Network error — clear local state anyway
    }
    setUser(null)
    setProfile(null)
  }, [])

  useEffect(() => {
    const supabase = supabaseRef.current

    // Use onAuthStateChange as the single source of truth.
    // Supabase fires an INITIAL_SESSION event on subscribe, which provides
    // the current session without a separate getSession() call — this avoids
    // double lock acquisition that causes Navigator Lock timeouts.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const fetchId = ++profileFetchIdRef.current
        fetchProfile(currentUser.id)
          .then((profileData) => {
            // Discard stale responses from earlier auth state changes
            if (profileFetchIdRef.current !== fetchId) return
            setProfile(profileData)
            setLoading(false)
          })
          .catch(() => {
            // Network error during profile fetch — still mark loading as done
            if (profileFetchIdRef.current !== fetchId) return
            setLoading(false)
          })
      } else {
        // No session — clean up any stale auth data from localStorage
        // so the Supabase client doesn't keep retrying token refreshes.
        if (_event === "INITIAL_SESSION") {
          supabase.auth.signOut({ scope: "local" }).catch(() => {})
        }
        profileFetchIdRef.current++
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const value = useMemo(
    () => ({ user, profile, loading, error, signOut, refreshProfile }),
    [user, profile, loading, error, signOut, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useUser() {
  const { user } = useAuth()
  return user
}

export function useProfile() {
  const { profile } = useAuth()
  return profile
}

export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user, loading }
}
