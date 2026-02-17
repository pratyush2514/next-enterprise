"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

import { AudioPreviewProvider, useAudioPreview } from "hooks/useAudioPreview"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { trackDetailViewed } from "lib/analytics"
import { cn } from "lib/utils"

import { FavoriteButton } from "./FavoriteButton"

interface TrackDetailProps {
  track: ITunesResult
}

function TrackDetailContent({ track }: TrackDetailProps) {
  const { activeTrackId, isPlaying, currentTime, duration, toggle } = useAudioPreview()
  const prefersReducedMotion = useReducedMotion()

  const artworkUrl = track.artworkUrl100?.replace("100x100", "600x600") ?? ""
  const hasPreview = Boolean(track.previewUrl)
  const isThisTrackPlaying = activeTrackId === track.trackId && isPlaying
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    trackDetailViewed(track.trackId, track.trackName, track.artistName)
  }, [track.trackId, track.trackName, track.artistName])

  const handlePlayToggle = () => {
    if (track.previewUrl) {
      toggle(track.trackId, track.previewUrl)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
      {/* Back link */}
      <Link
        href="/catalog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Back to Catalog
      </Link>

      <div className="flex flex-col gap-10 md:flex-row md:gap-12">
        {/* Artwork */}
        <motion.div
          className="relative mx-auto w-full max-w-sm shrink-0 md:mx-0 md:w-80"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-xl dark:bg-gray-800">
            {artworkUrl && (
              <Image
                src={artworkUrl}
                alt={`Album artwork for ${track.trackName}`}
                fill
                sizes="(max-width: 768px) 90vw, 320px"
                className="object-cover"
                priority
                unoptimized
              />
            )}
          </div>

          {/* Favorite button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton
              track={{
                trackId: track.trackId,
                trackName: track.trackName,
                artistName: track.artistName,
                artworkUrl100: track.artworkUrl100,
              }}
              size="md"
            />
          </div>
        </motion.div>

        {/* Track info */}
        <motion.div
          className="flex flex-1 flex-col"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {track.trackName}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{track.artistName}</p>

          {track.collectionName && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{track.collectionName}</p>
          )}

          {/* Metadata pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {track.primaryGenreName}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {track.trackPrice > 0 ? `${track.currency} ${track.trackPrice.toFixed(2)}` : "Free"}
            </span>
          </div>

          {/* Audio preview */}
          {hasPreview && (
            <div className="mt-8">
              <button
                type="button"
                onClick={handlePlayToggle}
                className={cn(
                  "inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold",
                  "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                  "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
                  isThisTrackPlaying
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                )}
              >
                {isThisTrackPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isThisTrackPlaying ? "Pause Preview" : "Play Preview"}
              </button>

              {/* Progress bar */}
              {isThisTrackPlaying && (
                <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </div>
          )}

          {/* View in iTunes */}
          {track.trackViewUrl && (
            <a
              href={track.trackViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-6 inline-flex items-center gap-2 text-sm font-medium",
                "text-gray-500 transition-colors hover:text-gray-900",
                "dark:text-gray-400 dark:hover:text-white"
              )}
            >
              View in iTunes Store
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.75a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47H12.25a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export function TrackDetail({ track }: TrackDetailProps) {
  return (
    <AudioPreviewProvider>
      <TrackDetailContent track={track} />
    </AudioPreviewProvider>
  )
}
