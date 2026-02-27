"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"

import { useAudioPreview } from "hooks/useAudioPreview"
import { cn } from "lib/utils"

import {
  ChevronDownIcon,
  MusicNoteIcon,
  PauseLargeIcon,
  PlayLargeIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipNextLargeIcon,
  SkipPrevIcon,
} from "./icons"
import { ProgressBar } from "./LiquidGlass"

interface FullscreenPlayerProps {
  open: boolean
  onClose: () => void
  trackName: string
  artistName: string
  artworkUrl: string
}

/**
 * Extract the dominant color from an image URL via a 1×1 canvas.
 * Falls back to a dark neutral if extraction fails (e.g. CORS).
 */
function extractDominantColor(url: string): Promise<string> {
  return new Promise((resolve) => {
    if (!url) {
      resolve("rgb(24,24,27)")
      return
    }
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 1
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve("rgb(24,24,27)")
          return
        }
        ctx.drawImage(img, 0, 0, 1, 1)
        const d = ctx.getImageData(0, 0, 1, 1).data
        resolve(`rgb(${d[0]},${d[1]},${d[2]})`)
      } catch {
        resolve("rgb(24,24,27)")
      }
    }
    img.onerror = () => resolve("rgb(24,24,27)")
    img.src = url
  })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function FullscreenPlayer({ open, onClose, trackName, artistName, artworkUrl }: FullscreenPlayerProps) {
  const t = useTranslations("songs.fullscreenPlayer")
  const {
    isPlaying,
    currentTime,
    duration,
    activeTrackId,
    toggle,
    seek,
    isShuffleOn,
    isRepeatOn,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrev,
  } = useAudioPreview()

  const [dominantColor, setDominantColor] = useState("rgb(24,24,27)")

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  // Extract dominant color when artwork changes
  useEffect(() => {
    if (!artworkUrl || !open) return
    let cancelled = false
    extractDominantColor(artworkUrl).then((color) => {
      if (!cancelled) setDominantColor(color)
    })
    return () => {
      cancelled = true
    }
  }, [artworkUrl, open])

  const handlePlayPause = useCallback(() => {
    if (!activeTrackId) return
    toggle(activeTrackId, "")
  }, [activeTrackId, toggle])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, ${dominantColor} 0%, rgb(0,0,0) 100%)`,
          }}
        >
          {/* Content */}
          <div className="pb-safe-bottom pt-safe-top relative flex h-[100dvh] flex-col items-center px-6">
            {/* Header — close + now playing */}
            <div className="flex w-full max-w-lg items-center justify-between py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
                aria-label={t("close")}
              >
                <ChevronDownIcon className="size-6" />
              </button>
              <p className="text-xs font-semibold tracking-[0.15em] text-white/50 uppercase">{t("nowPlaying")}</p>
              <div className="size-11" />
            </div>

            {/* Artwork — centered, large */}
            <div className="flex flex-1 items-center justify-center py-4">
              <div className="aspect-square w-full max-w-[400px] overflow-hidden rounded-lg bg-black/20 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                {artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artworkUrl.replace(/\d+x\d+bb/, "600x600bb")}
                    alt={trackName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <MusicNoteIcon className="size-20 text-white/10" />
                  </div>
                )}
              </div>
            </div>

            {/* Track info */}
            <div className="w-full max-w-lg px-2">
              <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{trackName}</h2>
              <p className="mt-1 truncate text-sm text-white/60">{artistName}</p>
            </div>

            {/* Progress bar + time */}
            <div className="mt-6 w-full max-w-lg px-2">
              <ProgressBar currentTime={currentTime} totalDuration={duration} onSeek={seek} />
              <div className="mt-1 flex justify-between text-[11px] text-white/40">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport controls */}
            <div className="mt-4 mb-10 flex w-full max-w-lg items-center justify-between px-2">
              <button
                type="button"
                onClick={toggleShuffle}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors",
                  isShuffleOn ? "text-emerald-400" : "text-white/40 hover:text-white/70"
                )}
                aria-label={t("shuffle")}
                aria-pressed={isShuffleOn}
              >
                <ShuffleIcon className="size-5" />
              </button>

              <button
                type="button"
                onClick={playPrev}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white transition-colors hover:text-white/80"
                aria-label={t("previous")}
              >
                <SkipPrevIcon className="size-8" />
              </button>

              <button
                type="button"
                onClick={handlePlayPause}
                className="flex size-16 items-center justify-center rounded-full bg-white text-gray-900 transition-transform hover:scale-105 active:scale-95"
                aria-label={isPlaying ? t("pause") : t("play")}
              >
                {isPlaying ? <PauseLargeIcon className="size-8" /> : <PlayLargeIcon className="size-8" />}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white transition-colors hover:text-white/80"
                aria-label={t("next")}
              >
                <SkipNextLargeIcon className="size-8" />
              </button>

              <button
                type="button"
                onClick={toggleRepeat}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors",
                  isRepeatOn ? "text-emerald-400" : "text-white/40 hover:text-white/70"
                )}
                aria-label={t("repeat")}
                aria-pressed={isRepeatOn}
              >
                <RepeatIcon className="size-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
