"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useFavorites } from "hooks/useFavorites"
import { cn } from "lib/utils"

import { FavoriteButton } from "./FavoriteButton"

export function FavoritesGrid() {
  const { favorites, count } = useFavorites()
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/catalog"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-1 inline size-4"
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
        </div>
        <h1 className="text-center text-3xl leading-tight font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Your Favorites
        </h1>
        <p className="max-w-md text-center text-base leading-relaxed text-gray-500 dark:text-gray-400">
          {count > 0 ? `${count} track${count === 1 ? "" : "s"} saved` : "No favorites yet"}
        </p>
      </div>

      {/* Empty state */}
      {count === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="size-7 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">No favorites yet</p>
          <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">
            Browse the catalog and tap the heart icon to save tracks
          </p>
          <Link
            href="/catalog"
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white",
              "bg-emerald-500 transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-600 active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            )}
          >
            Explore Catalog
          </Link>
        </div>
      )}

      {/* Favorites grid */}
      {count > 0 && (
        <div
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          role="list"
          aria-label="Favorite tracks"
        >
          {favorites.map((track, index) => {
            const artworkUrl = track.artworkUrl100?.replace("100x100", "300x300") ?? ""

            return (
              <motion.div
                key={track.trackId}
                role="listitem"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring" as const,
                  stiffness: 80,
                  damping: 20,
                  delay: index * 0.04,
                }}
              >
                <div
                  className={cn(
                    "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white",
                    "shadow-sm transition-[box-shadow,border-color] duration-300",
                    "hover:border-gray-300/80 hover:shadow-lg hover:shadow-gray-200/50",
                    "dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:shadow-black/20"
                  )}
                  onClick={() => router.push(`/catalog/${track.trackId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/catalog/${track.trackId}`)
                  }}
                  role="group"
                  aria-label={`${track.trackName} by ${track.artistName}`}
                  tabIndex={0}
                >
                  {/* Artwork */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {artworkUrl && (
                      <Image
                        src={artworkUrl}
                        alt={`Album artwork for ${track.trackName}`}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        unoptimized
                      />
                    )}

                    {/* Remove favorite button */}
                    <div className="absolute top-2 right-2 z-20">
                      <FavoriteButton track={track} />
                    </div>
                  </div>

                  {/* Track info */}
                  <div className="flex flex-1 flex-col gap-0.5 p-3.5">
                    <h3
                      className="truncate text-sm font-semibold text-gray-900 dark:text-white"
                      title={track.trackName}
                    >
                      {track.trackName}
                    </h3>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={track.artistName}>
                      {track.artistName}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
