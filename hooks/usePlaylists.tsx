"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { createClient } from "lib/supabase/client"
import type { Playlist } from "types/playlist"

import { useSession } from "./useSession"

interface PlaylistsContextValue {
  playlists: Playlist[]
  isLoading: boolean
  createPlaylist: (name: string) => Promise<Playlist | null>
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  updatePlaylistCover: (id: string, coverUrl: string) => void
}

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null)

function mapRow(row: {
  id: string
  user_id: string
  name: string
  cover_url: string | null
  created_at: string
  updated_at: string
}): Playlist {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    coverUrl: row.cover_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function PlaylistsProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useSession()

  const supabaseRef = useRef(createClient())

  // Fetch playlists from Supabase when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPlaylists([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    const supabase = supabaseRef.current

    async function fetchPlaylists() {
      try {
        const { data, error } = await supabase.from("playlists").select("*").order("created_at", { ascending: false })

        if (!cancelled && !error && data) {
          setPlaylists(data.map(mapRow))
        }
      } catch {
        // Network error — keep empty playlists
      }
      if (!cancelled) setIsLoading(false)
    }

    fetchPlaylists()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user])

  const createPlaylist = useCallback(
    async (name: string): Promise<Playlist | null> => {
      if (!user) return null

      const supabase = supabaseRef.current

      // Create optimistic placeholder
      const optimisticId = crypto.randomUUID()
      const now = new Date().toISOString()
      const optimistic: Playlist = {
        id: optimisticId,
        userId: user.id,
        name,
        coverUrl: null,
        createdAt: now,
        updatedAt: now,
      }

      setPlaylists((prev) => [optimistic, ...prev])

      try {
        const { data, error } = await supabase.from("playlists").insert({ user_id: user.id, name }).select().single()

        if (error || !data) {
          // Revert optimistic
          setPlaylists((prev) => prev.filter((p) => p.id !== optimisticId))
          return null
        }

        const created = mapRow(data)

        // Replace optimistic with real data
        setPlaylists((prev) => prev.map((p) => (p.id === optimisticId ? created : p)))

        return created
      } catch {
        setPlaylists((prev) => prev.filter((p) => p.id !== optimisticId))
        return null
      }
    },
    [user]
  )

  const deletePlaylist = useCallback(
    async (id: string) => {
      if (!user) return

      const supabase = supabaseRef.current
      let backup: Playlist | undefined

      // Capture backup inside updater to avoid stale closure
      setPlaylists((prev) => {
        backup = prev.find((p) => p.id === id)
        return prev.filter((p) => p.id !== id)
      })

      try {
        const { error } = await supabase.from("playlists").delete().eq("id", id)

        if (error && backup) {
          setPlaylists((prev) => [...prev, backup!])
        }
      } catch {
        if (backup) {
          setPlaylists((prev) => [...prev, backup!])
        }
      }
    },
    [user]
  )

  const renamePlaylist = useCallback(
    async (id: string, name: string) => {
      if (!user) return

      const supabase = supabaseRef.current
      let prevName = ""

      // Capture previous name inside updater to avoid stale closure
      setPlaylists((list) =>
        list.map((p) => {
          if (p.id === id) {
            prevName = p.name
            return { ...p, name }
          }
          return p
        })
      )

      try {
        const { error } = await supabase.from("playlists").update({ name }).eq("id", id)

        if (error) {
          setPlaylists((list) => list.map((p) => (p.id === id ? { ...p, name: prevName } : p)))
        }
      } catch {
        setPlaylists((list) => list.map((p) => (p.id === id ? { ...p, name: prevName } : p)))
      }
    },
    [user]
  )

  const updatePlaylistCover = useCallback(
    async (id: string, coverUrl: string) => {
      if (!user) return

      const supabase = supabaseRef.current
      let prevCover: string | null = null

      // Capture previous cover inside updater to avoid stale closure
      setPlaylists((list) =>
        list.map((p) => {
          if (p.id === id) {
            prevCover = p.coverUrl
            return { ...p, coverUrl }
          }
          return p
        })
      )

      try {
        const { error } = await supabase.from("playlists").update({ cover_url: coverUrl }).eq("id", id)

        if (error) {
          setPlaylists((list) => list.map((p) => (p.id === id ? { ...p, coverUrl: prevCover } : p)))
        }
      } catch {
        setPlaylists((list) => list.map((p) => (p.id === id ? { ...p, coverUrl: prevCover } : p)))
      }
    },
    [user]
  )

  const value = useMemo(
    () => ({
      playlists,
      isLoading,
      createPlaylist,
      deletePlaylist,
      renamePlaylist,
      updatePlaylistCover,
    }),
    [playlists, isLoading, createPlaylist, deletePlaylist, renamePlaylist, updatePlaylistCover]
  )

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>
}

export function usePlaylists(): PlaylistsContextValue {
  const context = useContext(PlaylistsContext)
  if (!context) {
    throw new Error("usePlaylists must be used within a PlaylistsProvider")
  }
  return context
}
