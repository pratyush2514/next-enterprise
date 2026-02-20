"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { useAudioPreview } from "hooks/useAudioPreview"
import type { ITunesResult } from "hooks/useCatalogSearch"

import { ExternalLinkIcon } from "./icons"
import { LiquidButton, LiquidGlassCard, Pause, Play, ProgressBar, VolumeBars } from "./LiquidGlass"

interface AudioPreviewOverlayProps {
  result: ITunesResult
}

export const AudioPreviewOverlay = React.memo(function AudioPreviewOverlay({ result }: AudioPreviewOverlayProps) {
  const { activeTrackId, isPlaying, currentTime, duration, toggle, seek } = useAudioPreview()
  const [reducedMotion, setReducedMotion] = useState(false)

  const isThisTrackPlaying = activeTrackId === result.trackId && isPlaying
  const isThisTrackActive = activeTrackId === result.trackId
  const previewUrl = result.previewUrl ?? ""

  useEffect(() => {
    if (typeof window === "undefined") return
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewUrl) {
      toggle(result.trackId, previewUrl)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && previewUrl) {
      e.preventDefault()
      e.stopPropagation()
      toggle(result.trackId, previewUrl)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className="absolute inset-0 z-10"
      role="region"
      aria-label={`Audio preview for ${result.trackName}`}
    >
      <LiquidGlassCard
        glassSize="sm"
        className="flex h-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-0 bg-black/50 p-3 dark:bg-black/60"
      >
        {/* Track info */}
        <h4 className="w-full min-w-0 truncate text-center text-sm font-semibold text-white">{result.trackName}</h4>
        <p className="w-full min-w-0 truncate text-center text-xs text-white/70">{result.artistName}</p>

        {/* Volume bars + play control */}
        <div className="flex items-center gap-3">
          <VolumeBars isPlaying={isThisTrackPlaying} reducedMotion={reducedMotion} />

          <LiquidButton
            aria-label={isThisTrackPlaying ? "Pause preview" : "Play preview"}
            className="h-10 w-10 rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            size="icon"
            variant="ghost"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
          >
            {isThisTrackPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </LiquidButton>

          {/* Open in iTunes */}
          <a
            href={result.trackViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
            aria-label={`Open ${result.trackName} in iTunes Store`}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className="size-4" />
          </a>
        </div>

        {/* Progress bar — synced to real audio time */}
        <div className="w-full">
          <ProgressBar
            currentTime={isThisTrackActive ? currentTime : 0}
            totalDuration={isThisTrackActive ? duration : 0}
            onSeek={seek}
          />
        </div>
      </LiquidGlassCard>
    </motion.div>
  )
})
