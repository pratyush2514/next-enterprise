"use client"

import { AnimatePresence } from "framer-motion"
import Image from "next/image"
import React from "react"

import { useAudioPreview } from "hooks/useAudioPreview"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { useHoverIntent } from "hooks/useHoverIntent"
import { cn } from "lib/utils"

import { AudioPreviewOverlay } from "./AudioPreviewOverlay"

interface CatalogCardProps {
  result: ITunesResult
  className?: string
}

export const CatalogCard = React.memo(function CatalogCard({ result, className }: CatalogCardProps) {
  const { activeTrackId } = useAudioPreview()
  const { containerProps, isHovering } = useHoverIntent(250)
  const artworkUrl = result.artworkUrl100?.replace("100x100", "300x300") ?? ""
  const hasPreview = Boolean(result.previewUrl)
  const isThisCardActive = activeTrackId === result.trackId
  const showOverlay = (isHovering || isThisCardActive) && hasPreview

  return (
    <div
      {...containerProps}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg",
        "dark:border-gray-700 dark:bg-gray-800",
        className
      )}
      role="group"
      aria-label={`${result.trackName} by ${result.artistName}`}
      tabIndex={0}
    >
      {/* Artwork area */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {artworkUrl && (
          <Image
            src={artworkUrl}
            alt={`Album artwork for ${result.trackName}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            unoptimized
          />
        )}

        {/* No preview badge */}
        {!hasPreview && (
          <span
            className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white/70"
            aria-label="No preview available"
          >
            No preview
          </span>
        )}
      </div>

      {/* Text info */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">{result.trackName}</h3>
        <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{result.artistName}</p>
        {result.collectionName && (
          <p className="line-clamp-1 text-xs text-gray-400 dark:text-gray-500">{result.collectionName}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {result.trackPrice > 0 ? `${result.currency} ${result.trackPrice.toFixed(2)}` : "Free"}
          </span>
          <span className="text-xs text-gray-400">{result.primaryGenreName}</span>
        </div>
      </div>

      {/* Glass preview overlay — absolute, covers entire card, no layout shift */}
      <AnimatePresence>{showOverlay && <AudioPreviewOverlay result={result} />}</AnimatePresence>
    </div>
  )
})
