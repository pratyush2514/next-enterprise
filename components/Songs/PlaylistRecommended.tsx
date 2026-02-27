"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { type QueueTrack, useAudioPreview } from "hooks/useAudioPreview"
import { usePlaylistSongs } from "hooks/usePlaylistSongs"
import { cn } from "lib/utils"
import type { PlaylistSongInput } from "types/playlist"

import { PauseLargeIcon, PlayLargeIcon, PlusIcon } from "./icons"
import { useUpdatePlaybackTrack } from "./SongsShell"

interface RecommendedTrack {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl100: string
  previewUrl?: string
  trackTimeMillis?: number
}

export function PlaylistRecommended() {
  const t = useTranslations("songs.playlistPage")
  const { addSong, hasSong } = usePlaylistSongs()
  const { activeTrackId, isPlaying, replaceQueue, toggle } = useAudioPreview()
  const updatePlaybackTrack = useUpdatePlaybackTrack()
  const [tracks, setTracks] = useState<RecommendedTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRecommended() {
      try {
        const res = await fetch("/api/itunes?term=top+hits&limit=8", {
          signal: controller.signal,
        })
        if (!res.ok) return

        const data = (await res.json()) as { results?: RecommendedTrack[] }
        if (data.results) {
          setTracks(
            data.results.map((r) => ({
              trackId: r.trackId,
              trackName: r.trackName,
              artistName: r.artistName,
              artworkUrl100: r.artworkUrl100,
              previewUrl: r.previewUrl,
              trackTimeMillis: r.trackTimeMillis,
            }))
          )
        }
      } catch {
        // Aborted or network error
      }
      setIsLoading(false)
    }

    fetchRecommended()
    return () => controller.abort()
  }, [])

  const handlePlay = useCallback(
    (track: RecommendedTrack, index: number) => {
      if (!track.previewUrl) return

      const isActive = activeTrackId === track.trackId
      if (isActive) {
        toggle(track.trackId, track.previewUrl)
        return
      }

      const queue: QueueTrack[] = tracks
        .filter((t) => t.previewUrl)
        .map((t) => ({
          trackId: t.trackId,
          previewUrl: t.previewUrl!,
          trackName: t.trackName,
          artistName: t.artistName,
          artworkUrl: t.artworkUrl100,
        }))

      const startIndex = queue.findIndex((q) => q.trackId === track.trackId)
      replaceQueue(queue, startIndex >= 0 ? startIndex : 0)
      updatePlaybackTrack?.({
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl: track.artworkUrl100,
      })
    },
    [tracks, activeTrackId, toggle, replaceQueue, updatePlaybackTrack]
  )

  const handleAdd = useCallback(
    (track: RecommendedTrack) => {
      const input: PlaylistSongInput = {
        trackId: track.trackId,
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl: track.artworkUrl100,
        previewUrl: track.previewUrl ?? "",
        durationMs: track.trackTimeMillis ?? 0,
      }
      addSong(input)
    },
    [addSong]
  )

  if (isLoading) {
    return (
      <div className="mt-10">
        <h3 className="mb-4 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
          {t("recommended")}
        </h3>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`rec-skel-${i}`} className="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2">
              <div className="size-10 shrink-0 rounded bg-gray-200 dark:bg-white/10" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tracks.length === 0) return null

  return (
    <div className="mt-10">
      <h3 className="mb-4 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
        {t("recommended")}
      </h3>

      <div className="space-y-1">
        {tracks.map((track, index) => {
          const alreadyAdded = hasSong(track.trackId)
          const isActive = activeTrackId === track.trackId
          const hasPreview = Boolean(track.previewUrl)

          return (
            <div
              key={track.trackId}
              className="group/rec flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {/* Artwork with play/pause overlay */}
              <button
                type="button"
                onClick={() => hasPreview && handlePlay(track, index)}
                disabled={!hasPreview}
                className={cn(
                  "relative size-10 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-white/5",
                  hasPreview ? "cursor-pointer" : "cursor-default"
                )}
              >
                {track.artworkUrl100 && (
                  <Image src={track.artworkUrl100} alt="" fill unoptimized className="object-cover" sizes="40px" />
                )}
                {hasPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                      {isActive && isPlaying ? (
                        <PauseLargeIcon className="size-3" />
                      ) : (
                        <PlayLargeIcon className="size-3" />
                      )}
                    </div>
                  </div>
                )}
              </button>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{track.trackName}</p>
                <p className="truncate text-xs text-gray-500 dark:text-white/50">{track.artistName}</p>
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={() => handleAdd(track)}
                disabled={alreadyAdded}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  alreadyAdded
                    ? "cursor-default text-emerald-500"
                    : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:text-white/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                )}
                aria-label={alreadyAdded ? "Added" : `${t("addSong")} ${track.trackName}`}
              >
                {alreadyAdded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <PlusIcon className="size-5" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
