"use client"

import React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { type QueueTrack, useAudioPreview } from "hooks/useAudioPreview"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { useHoverIntent } from "hooks/useHoverIntent"
import { useSession } from "hooks/useSession"
import { cn } from "lib/utils"

import { FavoriteButton } from "./FavoriteButton"
import { PlusIcon } from "./icons"
import { useUpdatePlaybackTrack } from "./SongsShell"

const AudioPreviewOverlay = dynamic(
  () => import("./AudioPreviewOverlay").then((mod) => ({ default: mod.AudioPreviewOverlay })),
  { ssr: false }
)

interface SongsTrackCardProps {
  result: ITunesResult
  allResults: ITunesResult[]
  onAuthRequired: (track: ITunesResult) => void
  onAddToPlaylist?: (track: ITunesResult) => void
  className?: string
}

export const SongsTrackCard = React.memo(function SongsTrackCard({
  result,
  allResults,
  onAuthRequired,
  onAddToPlaylist,
  className,
}: SongsTrackCardProps) {
  const t = useTranslations("songs")
  const { activeTrackId, toggle, replaceQueue } = useAudioPreview()
  const { isAuthenticated, isLoading } = useSession()
  const { containerProps, isHovering } = useHoverIntent(250)
  const updatePlaybackTrack = useUpdatePlaybackTrack()
  const prefersReducedMotion = useReducedMotion()

  const artworkUrl = result.artworkUrl100?.replace("100x100", "300x300") ?? ""
  const hasPreview = Boolean(result.previewUrl)
  const isThisCardActive = activeTrackId === result.trackId
  const showOverlay = (isHovering || isThisCardActive) && hasPreview && isAuthenticated

  const handlePlayAttempt = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasPreview) return

    if (isLoading) return

    if (!isAuthenticated) {
      onAuthRequired(result)
      return
    }

    // Build queue from all results that have previews
    const queue: QueueTrack[] = allResults
      .filter((r) => r.previewUrl)
      .map((r) => ({
        trackId: r.trackId,
        previewUrl: r.previewUrl!,
        trackName: r.trackName,
        artistName: r.artistName,
        artworkUrl: r.artworkUrl100?.replace("100x100", "300x300") ?? "",
      }))

    const startIndex = queue.findIndex((q) => q.trackId === result.trackId)

    if (isThisCardActive) {
      // Toggle play/pause for active track
      toggle(result.trackId, result.previewUrl!)
    } else {
      // Replace queue and start playback
      replaceQueue(queue, startIndex >= 0 ? startIndex : 0)
    }

    updatePlaybackTrack?.({
      trackName: result.trackName,
      artistName: result.artistName,
      artworkUrl: artworkUrl,
    })
  }

  return (
    <motion.div
      {...containerProps}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-gray-900",
        "shadow-sm transition-[box-shadow,border-color] duration-300",
        "hover:border-gray-300 hover:shadow-lg dark:hover:border-white/10 dark:hover:shadow-black/30",
        className
      )}
      role="group"
      aria-label={`${result.trackName} by ${result.artistName}`}
      tabIndex={0}
      onClick={handlePlayAttempt}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handlePlayAttempt(e as unknown as React.MouseEvent)
        }
      }}
    >
      {/* Artwork area */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-white/5">
        {artworkUrl && (
          <Image
            src={artworkUrl}
            alt={`Album artwork for ${result.trackName}`}
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            unoptimized
          />
        )}

        {/* Bottom frosted text overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pt-8 pb-2.5">
          <p className="truncate text-xs font-bold text-white drop-shadow-sm">{result.trackName}</p>
          <p className="truncate text-[10px] text-white/60">{result.artistName}</p>
        </div>

        {/* Favorite + Add to playlist buttons — always visible on mobile, hover-reveal on desktop */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
          {onAddToPlaylist && isAuthenticated && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAddToPlaylist(result)
              }}
              className="flex size-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label={t("addToPlaylist", { track: result.trackName })}
            >
              <PlusIcon className="size-4" />
            </button>
          )}
          <FavoriteButton
            track={{
              trackId: result.trackId,
              trackName: result.trackName,
              artistName: result.artistName,
              artworkUrl100: result.artworkUrl100,
            }}
          />
        </div>

        {/* No preview badge */}
        {!hasPreview && (
          <span
            className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm"
            aria-label={t("noPreviewAvailable")}
          >
            {t("noPreview")}
          </span>
        )}
      </div>

      {/* Text info */}
      <div className="flex flex-1 flex-col gap-0.5 p-3.5">
        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={result.trackName}>
          {result.trackName}
        </h3>
        <p className="truncate text-xs text-gray-500 dark:text-white/50" title={result.artistName}>
          {result.artistName}
        </p>
        {result.collectionName && (
          <p className="truncate text-xs text-gray-400 dark:text-white/30" title={result.collectionName}>
            {result.collectionName}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {result.trackPrice > 0 ? `${result.currency} ${result.trackPrice.toFixed(2)}` : t("free")}
          </span>
          <span className="truncate pl-2 text-[11px] text-gray-400 dark:text-white/30">{result.primaryGenreName}</span>
        </div>
      </div>

      {/* Glass preview overlay — absolute, covers entire card */}
      <AnimatePresence>{showOverlay && <AudioPreviewOverlay result={result} />}</AnimatePresence>
    </motion.div>
  )
})
