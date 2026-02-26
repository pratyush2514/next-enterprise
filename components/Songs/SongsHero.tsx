"use client"

import { useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { type QueueTrack, useAudioPreview } from "hooks/useAudioPreview"
import { useSession } from "hooks/useSession"
import type { PreviewPoster } from "lib/services/itunes"
import { cn } from "lib/utils"

import { MusicNoteIcon, PlayLargeIcon } from "./icons"
import { useUpdatePlaybackTrack } from "./SongsShell"

interface SongsHeroProps {
  featured: PreviewPoster[]
}

export function SongsHero({ featured }: SongsHeroProps) {
  const t = useTranslations("songs.hero")
  const prefersReducedMotion = useReducedMotion()
  const { replaceQueue, activeTrackId, isPlaying, toggle } = useAudioPreview()
  const { isAuthenticated } = useSession()
  const updatePlaybackTrack = useUpdatePlaybackTrack()

  const heroTrack = featured[0]
  const secondaryTracks = featured.slice(1, 6)

  const playTrack = useCallback(
    (track: PreviewPoster, _index: number) => {
      if (!track.previewUrl || !isAuthenticated) return

      const isActive = activeTrackId === track.trackId
      if (isActive) {
        toggle(track.trackId!, track.previewUrl)
        return
      }

      const queue: QueueTrack[] = featured
        .filter((t) => t.previewUrl && t.trackId)
        .map((t) => ({
          trackId: t.trackId!,
          previewUrl: t.previewUrl!,
          trackName: t.trackName,
          artistName: t.artistName,
          artworkUrl: t.artworkUrl,
        }))

      const startIndex = queue.findIndex((q) => q.trackId === track.trackId)
      replaceQueue(queue, startIndex >= 0 ? startIndex : 0)
      updatePlaybackTrack?.({
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl: track.artworkUrl,
      })
    },
    [featured, replaceQueue, toggle, activeTrackId, isAuthenticated, updatePlaybackTrack]
  )

  if (!heroTrack) return null

  const heroIsActive = activeTrackId === heroTrack.trackId
  const heroHasPreview = Boolean(heroTrack.previewUrl)

  return (
    <section className="relative overflow-hidden">
      {/* Blurred background artwork */}
      <div className="absolute inset-0 -z-10">
        {heroTrack.artworkUrl && (
          <Image
            src={heroTrack.artworkUrl}
            alt=""
            fill
            unoptimized
            className="scale-110 object-cover opacity-30 blur-[60px]"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gray-950/60" />
      </div>

      <div className="px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        {/* Featured label */}
        <motion.p
          className="mb-6 text-[10px] font-bold tracking-[0.2em] text-emerald-400/80 uppercase"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {t("featured")}
        </motion.p>

        {/* Hero content */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-10">
          {/* Hero artwork */}
          <motion.div
            className="relative size-48 shrink-0 overflow-hidden rounded-xl shadow-2xl shadow-black/50 sm:size-56 lg:size-60"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
          >
            {heroTrack.artworkUrl ? (
              <Image
                src={heroTrack.artworkUrl}
                alt={`${heroTrack.trackName} by ${heroTrack.artistName}`}
                fill
                unoptimized
                className="object-cover"
                sizes="240px"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-white/5">
                <MusicNoteIcon className="size-12 text-white/20" />
              </div>
            )}
          </motion.div>

          {/* Hero text */}
          <motion.div
            className="text-center md:text-left"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{heroTrack.trackName}</h2>
            <p className="mt-1 text-base text-white/60 lg:text-lg">{heroTrack.artistName}</p>
            {heroHasPreview && (
              <button
                type="button"
                onClick={() => playTrack(heroTrack, 0)}
                className={cn(
                  "mt-5 rounded-full bg-emerald-400 px-8 py-3 text-sm font-bold text-gray-900",
                  "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-300 active:scale-[0.98]"
                )}
              >
                {heroIsActive && isPlaying ? t("nowPlaying") : t("listenNow")}
              </button>
            )}
          </motion.div>
        </div>

        {/* Secondary featured tracks */}
        {secondaryTracks.length > 0 && (
          <motion.div
            className="mt-10 flex gap-4 overflow-x-auto scroll-smooth pb-2"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
          >
            {secondaryTracks.map((track, i) => {
              const isActive = activeTrackId === track.trackId
              const hasPreview = Boolean(track.previewUrl)

              return (
                <button
                  key={track.trackId ?? `hero-${i}`}
                  type="button"
                  onClick={() => hasPreview && playTrack(track, i + 1)}
                  className={cn("group shrink-0 text-left", hasPreview ? "cursor-pointer" : "cursor-default")}
                >
                  <div
                    className={cn(
                      "relative size-28 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-[1.03] sm:size-32",
                      isActive && "ring-2 ring-emerald-400"
                    )}
                  >
                    {track.artworkUrl ? (
                      <Image
                        src={track.artworkUrl}
                        alt={`${track.trackName} by ${track.artistName}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-white/5">
                        <MusicNoteIcon className="size-6 text-white/20" />
                      </div>
                    )}

                    {/* Play overlay on hover */}
                    {hasPreview && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all duration-200",
                            isActive ? "scale-100" : "scale-0 group-hover:scale-100"
                          )}
                        >
                          <PlayLargeIcon className="size-4" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pt-6 pb-1.5">
                      <p className="truncate text-[9px] font-bold text-white drop-shadow-sm">{track.trackName}</p>
                      <p className="truncate text-[7px] text-white/60">{track.artistName}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
