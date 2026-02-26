"use client"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
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

  const handlePlayPause = () => {
    if (!activeTrackId) return
    toggle(activeTrackId, "")
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 overflow-hidden bg-gray-950"
        >
          {/* Blurred artwork background */}
          {artworkUrl && (
            <div className="absolute inset-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artworkUrl} alt="" className="h-full w-full scale-150 object-cover opacity-20 blur-3xl" />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* Content */}
          <div className="pt-safe-top pb-safe-bottom relative flex h-[100dvh] flex-col items-center px-6">
            {/* Header — close button */}
            <div className="flex w-full max-w-lg items-center justify-between py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
                aria-label={t("close")}
              >
                <ChevronDownIcon className="size-6" />
              </button>
              <p className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase">{t("nowPlaying")}</p>
              <div className="size-11" /> {/* spacer */}
            </div>

            {/* Artwork */}
            <div className="flex flex-1 items-center justify-center py-4">
              <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl bg-white/5 shadow-2xl sm:max-w-sm">
                {artworkUrl ? (
                  <Image src={artworkUrl} alt={trackName} fill unoptimized className="object-cover" sizes="400px" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <MusicNoteIcon className="size-20 text-white/10" />
                  </div>
                )}
              </div>
            </div>

            {/* Track info */}
            <div className="w-full max-w-lg text-center">
              <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{trackName}</h2>
              <p className="mt-1 truncate text-sm text-white/50">{artistName}</p>
            </div>

            {/* Progress bar */}
            <div className="mt-6 w-full max-w-lg">
              <ProgressBar currentTime={currentTime} totalDuration={duration} onSeek={seek} />
            </div>

            {/* Transport controls */}
            <div className="mt-4 mb-8 flex w-full max-w-lg items-center justify-center gap-6">
              <button
                type="button"
                onClick={toggleShuffle}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors",
                  isShuffleOn ? "text-emerald-400" : "text-white/30 hover:text-white/60"
                )}
                aria-label={t("shuffle")}
                aria-pressed={isShuffleOn}
              >
                <ShuffleIcon className="size-5" />
              </button>

              <button
                type="button"
                onClick={playPrev}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white/60 transition-colors hover:text-white"
                aria-label={t("previous")}
              >
                <SkipPrevIcon className="size-7" />
              </button>

              <button
                type="button"
                onClick={handlePlayPause}
                className="flex size-16 items-center justify-center rounded-full bg-white text-gray-900 transition-transform hover:scale-105"
                aria-label={isPlaying ? t("pause") : t("play")}
              >
                {isPlaying ? <PauseLargeIcon className="size-7" /> : <PlayLargeIcon className="size-7" />}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white/60 transition-colors hover:text-white"
                aria-label={t("next")}
              >
                <SkipNextLargeIcon className="size-7" />
              </button>

              <button
                type="button"
                onClick={toggleRepeat}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors",
                  isRepeatOn ? "text-emerald-400" : "text-white/30 hover:text-white/60"
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
