"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { useAuth } from "lib/contexts/auth-context"
import { cn } from "lib/utils"
import type { Playlist } from "types/playlist"

import { PauseLargeIcon, PencilIcon, PlayLargeIcon, PlaylistIcon } from "./icons"
import { PlaylistEditOverlay } from "./PlaylistEditOverlay"

interface PlaylistHeaderProps {
  playlist: Playlist
  songCount: number
  onPlay: () => void
  onDelete: () => void
  isPlaying?: boolean
}

export function PlaylistHeader({ playlist, songCount, onPlay, onDelete, isPlaying = false }: PlaylistHeaderProps) {
  const t = useTranslations("songs.playlistPage")
  const { profile } = useAuth()
  const [editOverlayOpen, setEditOverlayOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Cover image area — click to open edit overlay */}
        <button
          type="button"
          onClick={() => setEditOverlayOpen(true)}
          className={cn(
            "group relative flex size-40 shrink-0 items-center justify-center self-center overflow-hidden rounded-xl shadow-lg transition-opacity sm:size-48 sm:self-auto",
            playlist.coverUrl
              ? "bg-gray-100 dark:bg-white/5"
              : "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 dark:from-emerald-400/10 dark:to-emerald-600/10"
          )}
          aria-label={t("editDetails")}
        >
          {playlist.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={playlist.coverUrl} alt={playlist.name} className="size-full object-cover" />
          ) : (
            <PlaylistIcon className="size-16 text-emerald-500/40" />
          )}

          {/* Hover overlay with pencil */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
            <PencilIcon className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </button>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col items-center sm:items-start">
          <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
            {t("title")}
          </p>

          {/* Title with edit button */}
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-center text-2xl font-bold text-gray-900 sm:text-left sm:text-3xl dark:text-white">
              {playlist.name}
            </h1>
            <button
              type="button"
              onClick={() => setEditOverlayOpen(true)}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:text-emerald-500 dark:text-white/30 dark:hover:text-emerald-400"
              aria-label={t("editName")}
            >
              <PencilIcon className="size-4" />
            </button>
          </div>

          {/* Creator */}
          {profile?.full_name && (
            <p className="mb-3 text-sm text-gray-500 dark:text-white/50">{t("creator", { name: profile.full_name })}</p>
          )}

          {/* Song count */}
          <p className="mb-4 text-xs text-gray-400 dark:text-white/30">{t("songCount", { count: songCount })}</p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPlay}
              disabled={songCount === 0}
              className={cn(
                "flex min-h-[44px] items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors",
                songCount > 0
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "cursor-not-allowed bg-gray-300 dark:bg-white/10"
              )}
            >
              {isPlaying ? <PauseLargeIcon className="size-4" /> : <PlayLargeIcon className="size-4" />}
              {isPlaying ? t("pause") : t("playAll")}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="min-h-[44px] rounded-full px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
            >
              {t("deletePlaylist")}
            </button>
          </div>
        </div>
      </div>

      {/* Edit overlay */}
      <PlaylistEditOverlay open={editOverlayOpen} onOpenChange={setEditOverlayOpen} playlist={playlist} />
    </>
  )
}
