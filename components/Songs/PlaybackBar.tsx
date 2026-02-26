"use client"

import * as Slider from "@radix-ui/react-slider"
import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { useAudioPreview } from "hooks/useAudioPreview"
import { cn } from "lib/utils"

import {
  MusicNoteIcon,
  PauseLargeIcon,
  PlayLargeIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipNextLargeIcon,
  SkipPrevIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "./icons"
import { ProgressBar } from "./LiquidGlass"

interface PlaybackTrackInfo {
  trackName: string
  artistName: string
  artworkUrl: string
}

export function PlaybackBar({ currentTrack }: { currentTrack: PlaybackTrackInfo | null }) {
  const t = useTranslations("songs.playbackBar")
  const {
    isPlaying,
    currentTime,
    duration,
    activeTrackId,
    toggle,
    seek,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    isShuffleOn,
    isRepeatOn,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrev,
  } = useAudioPreview()
  const prefersReducedMotion = useReducedMotion()

  const hasTrack = currentTrack && activeTrackId !== null

  const handlePlayPause = () => {
    if (!activeTrackId) return
    toggle(activeTrackId, "")
  }

  const handleVolumeChange = (values: number[]) => {
    const val = values[0]
    if (val !== undefined) {
      setVolume(val / 100)
    }
  }

  return (
    <motion.div
      className="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-xl dark:border-white/5 dark:bg-gray-950/95"
      initial={prefersReducedMotion ? false : { y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
    >
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center gap-4 px-4 lg:px-6">
        {/* Left — Track info */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-[280px] lg:flex-none">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
            {hasTrack && currentTrack.artworkUrl ? (
              <Image src={currentTrack.artworkUrl} alt="" fill unoptimized className="object-cover" sizes="48px" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <MusicNoteIcon className="size-5 text-gray-300 dark:text-white/20" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {hasTrack ? currentTrack.trackName : t("nowPlaying")}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-white/40">
              {hasTrack ? currentTrack.artistName : "\u00A0"}
            </p>
          </div>
        </div>

        {/* Center — Transport controls + progress */}
        <div className="hidden flex-1 flex-col items-center gap-1.5 md:flex">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn(
                "transition-colors",
                isShuffleOn
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-gray-300 hover:text-gray-500 dark:text-white/30 dark:hover:text-white/60"
              )}
              aria-label={t("shuffle")}
              aria-pressed={isShuffleOn}
            >
              <ShuffleIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={playPrev}
              disabled={!hasTrack}
              className={cn(
                "transition-colors",
                hasTrack
                  ? "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                  : "text-gray-200 dark:text-white/20"
              )}
              aria-label={t("previous")}
            >
              <SkipPrevIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-all duration-200",
                hasTrack
                  ? "bg-gray-900 text-white hover:scale-105 dark:bg-white dark:text-gray-900"
                  : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-white/20 dark:text-white/40"
              )}
              aria-label={isPlaying ? t("pause") : t("play")}
              disabled={!hasTrack}
            >
              {isPlaying ? <PauseLargeIcon className="size-4" /> : <PlayLargeIcon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={playNext}
              disabled={!hasTrack}
              className={cn(
                "transition-colors",
                hasTrack
                  ? "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                  : "text-gray-200 dark:text-white/20"
              )}
              aria-label={t("next")}
            >
              <SkipNextLargeIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={toggleRepeat}
              className={cn(
                "transition-colors",
                isRepeatOn
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-gray-300 hover:text-gray-500 dark:text-white/30 dark:hover:text-white/60"
              )}
              aria-label={t("repeat")}
              aria-pressed={isRepeatOn}
            >
              <RepeatIcon className="size-4" />
            </button>
          </div>
          <div className="w-full max-w-md">
            <ProgressBar
              currentTime={hasTrack ? currentTime : 0}
              totalDuration={hasTrack ? duration : 0}
              onSeek={seek}
            />
          </div>
        </div>

        {/* Right — Volume */}
        <div className="group hidden items-center gap-2 lg:flex lg:w-[280px] lg:flex-none lg:justify-end">
          <button
            type="button"
            onClick={toggleMute}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
            aria-label={isMuted ? t("unmute") : t("mute")}
          >
            {isMuted ? <VolumeMuteIcon className="size-5" /> : <VolumeIcon className="size-5" />}
          </button>
          <Slider.Root
            className="relative flex h-5 w-24 touch-none items-center select-none"
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            aria-label={t("volume")}
          >
            <Slider.Track className="relative h-1 grow overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <Slider.Range className="absolute h-full rounded-full bg-gray-400 dark:bg-white/40" />
            </Slider.Track>
            <Slider.Thumb className="block size-3 cursor-pointer rounded-full bg-gray-600 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none dark:bg-white" />
          </Slider.Root>
        </div>

        {/* Mobile — prev/play/next + mini progress */}
        <div className="flex flex-col items-center gap-1 md:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playPrev}
              disabled={!hasTrack}
              className={cn(
                "flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors",
                hasTrack
                  ? "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                  : "text-gray-200 dark:text-white/20"
              )}
              aria-label={t("previous")}
            >
              <SkipPrevIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              className={cn(
                "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all duration-200",
                hasTrack
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-white/20 dark:text-white/40"
              )}
              aria-label={isPlaying ? t("pause") : t("play")}
              disabled={!hasTrack}
            >
              {isPlaying ? <PauseLargeIcon className="size-4" /> : <PlayLargeIcon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={playNext}
              disabled={!hasTrack}
              className={cn(
                "flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors",
                hasTrack
                  ? "text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                  : "text-gray-200 dark:text-white/20"
              )}
              aria-label={t("next")}
            >
              <SkipNextLargeIcon className="size-4" />
            </button>
          </div>
          <div className="w-full max-w-[200px]">
            <ProgressBar
              currentTime={hasTrack ? currentTime : 0}
              totalDuration={hasTrack ? duration : 0}
              onSeek={seek}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
