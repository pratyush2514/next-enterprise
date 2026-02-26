"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { createClient } from "lib/supabase/client"

import { useSession } from "./useSession"

export interface FavoriteTrack {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl100: string
}

interface FavoritesContextValue {
  favorites: FavoriteTrack[]
  isFavorite: (trackId: number) => boolean
  toggleFavorite: (track: FavoriteTrack) => void
  count: number
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useSession()

  // Use the singleton client via a ref for stable reference
  const supabaseRef = useRef(createClient())

  // Fetch favorites from Supabase when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setFavorites([])
      setIsLoading(false)
      return
    }

    const supabase = supabaseRef.current

    async function fetchFavorites() {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("track_id, track_name, artist_name, artwork_url")
          .order("created_at", { ascending: false })

        if (!error && data) {
          setFavorites(
            data.map((row: { track_id: number; track_name: string; artist_name: string; artwork_url: string }) => ({
              trackId: row.track_id,
              trackName: row.track_name,
              artistName: row.artist_name,
              artworkUrl100: row.artwork_url,
            }))
          )
        }
      } catch {
        // Network error — Supabase unreachable, keep empty favorites
      }
      setIsLoading(false)
    }

    fetchFavorites()
  }, [isAuthenticated, user])

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.trackId)), [favorites])

  const isFavorite = useCallback((trackId: number) => favoriteIds.has(trackId), [favoriteIds])

  const toggleFavorite = useCallback(
    async (track: FavoriteTrack) => {
      if (!user) return

      const supabase = supabaseRef.current
      const exists = favorites.some((f) => f.trackId === track.trackId)

      try {
        if (exists) {
          // Optimistic removal
          setFavorites((prev) => prev.filter((f) => f.trackId !== track.trackId))

          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("track_id", track.trackId)

          if (error) {
            // Revert on error
            setFavorites((prev) => [...prev, track])
          }
        } else {
          // Optimistic addition
          setFavorites((prev) => [track, ...prev])

          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            track_id: track.trackId,
            track_name: track.trackName,
            artist_name: track.artistName,
            artwork_url: track.artworkUrl100,
          })

          if (error) {
            // Revert on error
            setFavorites((prev) => prev.filter((f) => f.trackId !== track.trackId))
          }
        }
      } catch {
        // Network error — revert optimistic update
        if (exists) {
          setFavorites((prev) => [...prev, track])
        } else {
          setFavorites((prev) => prev.filter((f) => f.trackId !== track.trackId))
        }
      }
    },
    [user, favorites]
  )

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      count: favorites.length,
      isLoading,
    }),
    [favorites, isFavorite, toggleFavorite, isLoading]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
