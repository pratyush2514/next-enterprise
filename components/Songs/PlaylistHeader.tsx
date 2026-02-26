"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { usePlaylists } from "hooks/usePlaylists"
import { useAuth } from "lib/contexts/auth-context"
import { cn } from "lib/utils"
import type { Playlist } from "types/playlist"

import { PauseLargeIcon, PlayLargeIcon, PlaylistIcon } from "./icons"

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
  const { renamePlaylist } = usePlaylists()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(playlist.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleStartEdit = () => {
    setEditValue(playlist.name)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== playlist.name) {
      renamePlaylist(playlist.id, trimmed)
    }
    setIsEditing(false)
  }, [editValue, playlist.id, playlist.name, renamePlaylist])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(playlist.name)
      setIsEditing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      {/* Cover image area */}
      <div className="flex size-40 shrink-0 items-center justify-center self-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 shadow-lg sm:size-48 sm:self-auto dark:from-emerald-400/10 dark:to-emerald-600/10">
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt={playlist.name} className="size-full rounded-xl object-cover" />
        ) : (
          <PlaylistIcon className="size-16 text-emerald-500/40" />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col items-center sm:items-start">
        <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
          {t("title")}
        </p>

        {/* Editable title */}
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="mb-1 w-full rounded-lg border border-emerald-300 bg-transparent px-2 py-1 text-2xl font-bold text-gray-900 outline-none sm:text-3xl dark:border-emerald-500/30 dark:text-white"
            aria-label={t("editName")}
          />
        ) : (
          <button
            type="button"
            onClick={handleStartEdit}
            className="mb-1 text-center text-2xl font-bold text-gray-900 transition-colors hover:text-emerald-600 sm:text-left sm:text-3xl dark:text-white dark:hover:text-emerald-400"
            title={t("editName")}
          >
            {playlist.name}
          </button>
        )}

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
              songCount > 0 ? "bg-emerald-500 hover:bg-emerald-600" : "cursor-not-allowed bg-gray-300 dark:bg-white/10"
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
  )
}
