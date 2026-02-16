"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import React from "react"

import { useAudioPreview } from "hooks/useAudioPreview"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { useFeatureFlag } from "hooks/useFeatureFlag"
import { useHoverIntent } from "hooks/useHoverIntent"
import { cn } from "lib/utils"

import { AudioPreviewOverlay } from "./AudioPreviewOverlay"

const AI_SUMMARIES: Record<string, string> = {
  Pop: "Upbeat and catchy — perfect for energizing your space",
  Rock: "Raw energy with driving rhythms and bold guitar",
  "R&B/Soul": "Smooth grooves and soulful vocals for a relaxed vibe",
  Jazz: "Sophisticated and mellow — ideal for dining atmospheres",
  "Hip-Hop/Rap": "Bold beats and lyrical flow with modern edge",
  Electronic: "Pulsing synths and dynamic textures for the dancefloor",
  Country: "Heartfelt storytelling with acoustic warmth",
  Classical: "Timeless compositions with orchestral depth",
  Alternative: "Eclectic sounds that push creative boundaries",
  Dance: "High-energy rhythms built to move your body",
}

function getAiSummary(genre: string): string {
  return AI_SUMMARIES[genre] ?? "A curated pick for your playlist"
}

interface CatalogCardProps {
  result: ITunesResult
  className?: string
}

export const CatalogCard = React.memo(function CatalogCard({ result, className }: CatalogCardProps) {
  const { activeTrackId } = useAudioPreview()
  const { containerProps, isHovering } = useHoverIntent(250)
  const showAiSummary = useFeatureFlag("ai-summaries")
  const artworkUrl = result.artworkUrl100?.replace("100x100", "300x300") ?? ""
  const hasPreview = Boolean(result.previewUrl)
  const isThisCardActive = activeTrackId === result.trackId
  const showOverlay = (isHovering || isThisCardActive) && hasPreview

  return (
    <motion.div
      {...containerProps}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white",
        "shadow-sm transition-[box-shadow,border-color] duration-300",
        "hover:border-gray-300/80 hover:shadow-lg hover:shadow-gray-200/50",
        "dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20",
        className
      )}
      role="group"
      aria-label={`${result.trackName} by ${result.artistName}`}
      tabIndex={0}
    >
      {/* Artwork area */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
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

        {/* No preview badge */}
        {!hasPreview && (
          <span
            className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm"
            aria-label="No preview available"
          >
            No preview
          </span>
        )}
      </div>

      {/* Text info */}
      <div className="flex flex-1 flex-col gap-0.5 p-3.5">
        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={result.trackName}>
          {result.trackName}
        </h3>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={result.artistName}>
          {result.artistName}
        </p>
        {result.collectionName && (
          <p className="truncate text-xs text-gray-400 dark:text-gray-500" title={result.collectionName}>
            {result.collectionName}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {result.trackPrice > 0 ? `${result.currency} ${result.trackPrice.toFixed(2)}` : "Free"}
          </span>
          <span className="truncate pl-2 text-[11px] text-gray-400 dark:text-gray-500">{result.primaryGenreName}</span>
        </div>
        {showAiSummary && result.primaryGenreName && (
          <p className="mt-1 text-[11px] leading-snug text-gray-400 italic dark:text-gray-500">
            {getAiSummary(result.primaryGenreName)}
          </p>
        )}
      </div>

      {/* Glass preview overlay — absolute, covers entire card, no layout shift */}
      <AnimatePresence>{showOverlay && <AudioPreviewOverlay result={result} />}</AnimatePresence>
    </motion.div>
  )
})
