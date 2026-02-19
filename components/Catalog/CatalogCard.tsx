"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { useAudioPreview } from "hooks/useAudioPreview"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { useHoverIntent } from "hooks/useHoverIntent"
import { useRouter } from "i18n/navigation"
import { cn } from "lib/utils"

import { FavoriteButton } from "./FavoriteButton"

const AudioPreviewOverlay = dynamic(
  () => import("./AudioPreviewOverlay").then((mod) => ({ default: mod.AudioPreviewOverlay })),
  { ssr: false }
)

interface CatalogCardProps {
  result: ITunesResult
  className?: string
}

export const CatalogCard = React.memo(function CatalogCard({ result, className }: CatalogCardProps) {
  const t = useTranslations("catalog")
  const router = useRouter()
  const { activeTrackId } = useAudioPreview()
  const { containerProps, isHovering } = useHoverIntent(250)
  const artworkUrl = result.artworkUrl100?.replace("100x100", "300x300") ?? ""
  const hasPreview = Boolean(result.previewUrl)
  const isThisCardActive = activeTrackId === result.trackId
  const showOverlay = (isHovering || isThisCardActive) && hasPreview

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements (buttons, links)
    const target = e.target as HTMLElement
    if (target.closest("button, a")) return
    router.push(`/catalog/${result.trackId}`)
  }

  return (
    <motion.div
      {...containerProps}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white",
        "shadow-sm transition-[box-shadow,border-color] duration-300",
        "hover:border-gray-300/80 hover:shadow-lg hover:shadow-gray-200/50",
        "dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20",
        className
      )}
      role="group"
      aria-label={`${result.trackName} by ${result.artistName}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          router.push(`/catalog/${result.trackId}`)
        }
      }}
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

        {/* Favorite button */}
        <div className="absolute top-2 right-2 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
            aria-label="No preview available"
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
      </div>

      {/* Glass preview overlay — absolute, covers entire card, no layout shift */}
      <AnimatePresence>{showOverlay && <AudioPreviewOverlay result={result} />}</AnimatePresence>
    </motion.div>
  )
})
