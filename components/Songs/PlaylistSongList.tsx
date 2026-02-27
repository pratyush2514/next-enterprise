"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

import { useAudioPreview } from "hooks/useAudioPreview"
import { cn } from "lib/utils"
import type { PlaylistSong } from "types/playlist"

import { CloseIcon, PlayLargeIcon } from "./icons"

interface PlaylistSongListProps {
  songs: PlaylistSong[]
  onRemove: (trackId: number) => void
  onPlay: (index: number) => void
}

export function PlaylistSongList({ songs, onRemove, onPlay }: PlaylistSongListProps) {
  const t = useTranslations("songs.playlistPage")
  const { activeTrackId, isPlaying } = useAudioPreview()

  if (songs.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xs font-bold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
        {t("songCount", { count: songs.length })}
      </h3>

      <div className="space-y-1">
        {songs.map((song, index) => {
          const isActive = activeTrackId === song.trackId
          const isCurrentlyPlaying = isActive && isPlaying

          return (
            <div
              key={song.id}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-emerald-400/10 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/5"
              )}
            >
              {/* Index / play button */}
              <button
                type="button"
                onClick={() => onPlay(index)}
                className="flex size-8 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center"
                aria-label={`Play ${song.trackName}`}
              >
                {isCurrentlyPlaying ? (
                  <div className="flex items-end gap-0.5">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className="w-[3px] animate-bounce rounded-full bg-emerald-500"
                        style={{
                          height: `${8 + bar * 3}px`,
                          animationDelay: `${bar * 0.15}s`,
                          animationDuration: "0.6s",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-medium text-gray-400 group-hover:hidden dark:text-white/30">
                    {index + 1}
                  </span>
                )}
                {!isCurrentlyPlaying && <PlayLargeIcon className="hidden size-4 group-hover:block" />}
              </button>

              {/* Artwork */}
              <div className="relative size-8 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-white/5">
                {song.artworkUrl && (
                  <Image src={song.artworkUrl} alt="" fill unoptimized className="object-cover" sizes="32px" />
                )}
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", isActive && "text-emerald-600 dark:text-emerald-400")}>
                  {song.trackName}
                </p>
                <p className="truncate text-xs opacity-60">{song.artistName}</p>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(song.trackId)}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-white/20 dark:hover:text-red-400"
                aria-label={`${t("removeSong")} ${song.trackName}`}
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
