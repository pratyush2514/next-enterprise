"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"

import { useAudioPreview } from "hooks/useAudioPreview"
import { cn } from "lib/utils"
import { type ExtractedPalette, extractPalette, getCachedPalette, withAlpha } from "lib/utils/colorExtraction"

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
  /** Fallback track info for when queue is empty (single-track play from grid) */
  fallbackTrackName?: string
  fallbackArtistName?: string
  fallbackArtworkUrl?: string
}

const FALLBACK_PALETTE: [string, string, string] = ["rgb(24,24,27)", "rgb(15,15,20)", "rgb(10,10,12)"]

export function FullscreenPlayer({
  open,
  onClose,
  fallbackTrackName = "",
  fallbackArtistName = "",
  fallbackArtworkUrl = "",
}: FullscreenPlayerProps) {
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
    queue,
    queueIndex,
  } = useAudioPreview()

  // Queue-first track info — falls back to props for single-track plays (no queue)
  const queueTrack = queue[queueIndex] ?? null
  const trackName = queueTrack?.trackName || fallbackTrackName
  const artistName = queueTrack?.artistName || fallbackArtistName
  const artworkUrl = queueTrack?.artworkUrl || fallbackArtworkUrl
  const highResUrl = artworkUrl ? artworkUrl.replace(/\d+x\d+bb/, "600x600bb") : ""

  // Palette state — initialize from cache if available
  const [palette, setPalette] = useState<[string, string, string]>(
    () => (highResUrl ? getCachedPalette(highResUrl)?.colors : null) ?? FALLBACK_PALETTE
  )
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Keyboard shortcuts: Escape to close, Space to toggle play/pause
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        !!target?.isContentEditable

      if (isEditableTarget) return

      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.code === "Space") {
        e.preventDefault()
        if (activeTrackId) toggle(activeTrackId, "")
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose, activeTrackId, toggle])

  // Sync palette when track artwork changes — instant from cache, async fallback.
  // Keeps previous palette visible until new one is ready (no fallback flash).
  useEffect(() => {
    if (!highResUrl) return

    const cached = getCachedPalette(highResUrl)
    if (cached) {
      setPalette(cached.colors)
      return
    }

    // Cache miss — keep current palette visible, crossfade when extraction completes
    let cancelled = false
    extractPalette(highResUrl).then((p: ExtractedPalette) => {
      if (!cancelled) setPalette(p.colors)
    })
    return () => {
      cancelled = true
    }
  }, [highResUrl])

  // Pre-warm palettes for adjacent queue tracks so next/prev transitions are instant
  useEffect(() => {
    if (!open) return
    for (const offset of [-1, 1]) {
      const track = queue[queueIndex + offset]
      if (track?.artworkUrl) {
        extractPalette(track.artworkUrl.replace(/\d+x\d+bb/, "600x600bb"))
      }
    }
  }, [open, queueIndex, queue])

  const handlePlayPause = useCallback(() => {
    if (!activeTrackId) return
    toggle(activeTrackId, "")
  }, [activeTrackId, toggle])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!touchStart) return
      const touch = e.changedTouches[0]
      if (!touch) return

      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y

      // Swipe down to dismiss fullscreen, ignore mostly horizontal swipes.
      if (deltaY > 100 && Math.abs(deltaX) < 80) {
        onClose()
      }
      setTouchStart(null)
    },
    [onClose, touchStart]
  )

  const handleTouchCancel = useCallback(() => {
    setTouchStart(null)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="fixed inset-0 z-50 overflow-hidden bg-black"
        >
          {/* Multi-color gradient backdrop — default AnimatePresence for true crossfade
              (both old and new layers overlap during transition, no black gap) */}
          <AnimatePresence initial={false}>
            <motion.div
              key={palette.join(",")}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                background: [
                  `radial-gradient(ellipse at 30% 0%, ${withAlpha(palette[0], 0.85)} 0%, transparent 55%)`,
                  `radial-gradient(ellipse at 70% 25%, ${withAlpha(palette[1], 0.55)} 0%, transparent 45%)`,
                  `linear-gradient(to bottom, ${withAlpha(palette[0], 0.7)} 0%, ${palette[2]} 55%, rgb(0,0,0) 100%)`,
                ].join(", "),
              }}
            />
          </AnimatePresence>

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
                  <img src={highResUrl} alt={trackName} className="size-full object-cover" />
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

            {/* Progress bar (includes time display) */}
            <div className="mt-6 w-full max-w-lg px-2">
              <ProgressBar currentTime={currentTime} totalDuration={duration} onSeek={seek} />
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
