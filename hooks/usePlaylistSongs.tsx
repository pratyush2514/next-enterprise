"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { createClient } from "lib/supabase/client"
import type { PlaylistSong, PlaylistSongInput } from "types/playlist"

import { useSession } from "./useSession"

interface PlaylistSongsContextValue {
  songs: PlaylistSong[]
  isLoading: boolean
  addSong: (input: PlaylistSongInput) => void
  removeSong: (trackId: number) => void
  hasSong: (trackId: number) => boolean
}

const PlaylistSongsContext = createContext<PlaylistSongsContextValue | null>(null)

function mapRow(row: {
  id: string
  playlist_id: string
  track_id: number
  track_name: string
  artist_name: string
  artwork_url: string
  preview_url: string
  duration_ms: number
  position: number
  added_at: string
}): PlaylistSong {
  return {
    id: row.id,
    playlistId: row.playlist_id,
    trackId: row.track_id,
    trackName: row.track_name,
    artistName: row.artist_name,
    artworkUrl: row.artwork_url,
    previewUrl: row.preview_url,
    durationMs: row.duration_ms,
    position: row.position,
    addedAt: row.added_at,
  }
}

export function PlaylistSongsProvider({ playlistId, children }: { playlistId: string; children: React.ReactNode }) {
  const [songs, setSongs] = useState<PlaylistSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useSession()

  const supabaseRef = useRef(createClient())

  // Fetch songs for this playlist
  useEffect(() => {
    if (!isAuthenticated || !user || !playlistId) {
      setSongs([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    const supabase = supabaseRef.current

    async function fetchSongs() {
      try {
        const { data, error } = await supabase
          .from("playlist_songs")
          .select("*")
          .eq("playlist_id", playlistId)
          .order("position", { ascending: true })

        if (!cancelled && !error && data) {
          setSongs(data.map(mapRow))
        }
      } catch {
        // Network error
      }
      if (!cancelled) setIsLoading(false)
    }

    fetchSongs()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user, playlistId])

  const songIds = useMemo(() => new Set(songs.map((s) => s.trackId)), [songs])

  const hasSong = useCallback((trackId: number) => songIds.has(trackId), [songIds])

  const addSong = useCallback(
    async (input: PlaylistSongInput) => {
      if (!user || hasSong(input.trackId)) return

      const supabase = supabaseRef.current
      const now = new Date().toISOString()
      const optimisticId = crypto.randomUUID()

      // Use functional updater to get accurate position from current state
      let position = 0
      setSongs((prev) => {
        position = prev.length
        const optimistic: PlaylistSong = {
          id: optimisticId,
          playlistId,
          trackId: input.trackId,
          trackName: input.trackName,
          artistName: input.artistName,
          artworkUrl: input.artworkUrl,
          previewUrl: input.previewUrl,
          durationMs: input.durationMs,
          position,
          addedAt: now,
        }
        return [...prev, optimistic]
      })

      try {
        const { data, error } = await supabase
          .from("playlist_songs")
          .insert({
            playlist_id: playlistId,
            track_id: input.trackId,
            track_name: input.trackName,
            artist_name: input.artistName,
            artwork_url: input.artworkUrl,
            preview_url: input.previewUrl,
            duration_ms: input.durationMs,
            position,
          })
          .select()
          .single()

        if (error || !data) {
          setSongs((prev) => prev.filter((s) => s.id !== optimisticId))
          return
        }

        const created = mapRow(data)
        setSongs((prev) => prev.map((s) => (s.id === optimisticId ? created : s)))
      } catch {
        setSongs((prev) => prev.filter((s) => s.id !== optimisticId))
      }
    },
    [user, playlistId, hasSong]
  )

  const removeSong = useCallback(
    async (trackId: number) => {
      if (!user) return

      const supabase = supabaseRef.current
      let backup: PlaylistSong | undefined

      // Capture backup inside updater to avoid stale closure
      setSongs((prev) => {
        backup = prev.find((s) => s.trackId === trackId)
        return prev.filter((s) => s.trackId !== trackId)
      })

      try {
        const { error } = await supabase
          .from("playlist_songs")
          .delete()
          .eq("playlist_id", playlistId)
          .eq("track_id", trackId)

        if (error && backup) {
          setSongs((prev) => [...prev, backup!].sort((a, b) => a.position - b.position))
        }
      } catch {
        if (backup) {
          setSongs((prev) => [...prev, backup!].sort((a, b) => a.position - b.position))
        }
      }
    },
    [user, playlistId]
  )

  const value = useMemo(
    () => ({ songs, isLoading, addSong, removeSong, hasSong }),
    [songs, isLoading, addSong, removeSong, hasSong]
  )

  return <PlaylistSongsContext.Provider value={value}>{children}</PlaylistSongsContext.Provider>
}

export function usePlaylistSongs(): PlaylistSongsContextValue {
  const context = useContext(PlaylistSongsContext)
  if (!context) {
    throw new Error("usePlaylistSongs must be used within a PlaylistSongsProvider")
  }
  return context
}
