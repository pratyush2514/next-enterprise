"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "melodix-favorites"

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
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function loadFavorites(): FavoriteTrack[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as FavoriteTrack[]) : []
  } catch {
    return []
  }
}

function saveFavorites(favorites: FavoriteTrack[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage after mount (SSR-safe)
  useEffect(() => {
    setFavorites(loadFavorites())
    setMounted(true)
  }, [])

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.trackId)), [favorites])

  const isFavorite = useCallback((trackId: number) => favoriteIds.has(trackId), [favoriteIds])

  const toggleFavorite = useCallback((track: FavoriteTrack) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.trackId === track.trackId)
      const next = exists ? prev.filter((f) => f.trackId !== track.trackId) : [...prev, track]
      saveFavorites(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      favorites: mounted ? favorites : [],
      isFavorite: mounted ? isFavorite : () => false,
      toggleFavorite,
      count: mounted ? favorites.length : 0,
    }),
    [favorites, isFavorite, toggleFavorite, mounted]
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
