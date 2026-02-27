"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { useCatalogSearch } from "hooks/useCatalogSearch"
import type { ITunesResult } from "hooks/useCatalogSearch"
import { useDebounce } from "hooks/useDebounce"
import { cn } from "lib/utils"

import { AddToPlaylistPopup } from "./AddToPlaylistPopup"
import { SearchIcon, TrendingIcon, WarningCircleIcon } from "./icons"
import { SongsSearch } from "./SongsSearch"
import { useAuthOverlay } from "./SongsShell"
import { SongsSkeleton } from "./SongsSkeleton"
import { SongsTrackCard } from "./SongsTrackCard"

const PAGE_SIZE = 20

export function SongsGrid() {
  const t = useTranslations("songs")
  const [query, setQuery] = useState("")
  const [retryKey, setRetryKey] = useState(0)
  const debouncedQuery = useDebounce(query, 300)
  const { results, isLoading, isLoadingMore, error, hasMore, loadMore, isFeatured } = useCatalogSearch(
    debouncedQuery,
    retryKey
  )
  const prefersReducedMotion = useReducedMotion()

  const requestAuth = useAuthOverlay() ?? (() => {})
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<ITunesResult | null>(null)

  return (
    <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:text-white/30">
          {t("pageTitle")}
        </p>
        <h1 className="text-center text-2xl leading-tight font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
          {t("heading")}
        </h1>
        <p className="max-w-md text-center text-sm leading-relaxed text-gray-500 dark:text-white/50">{t("subtext")}</p>
        <div className="mt-4 w-full max-w-lg">
          <SongsSearch value={query} onChange={setQuery} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
            <WarningCircleIcon className="size-7 text-red-400" />
          </div>
          <p className="text-base font-medium text-red-400">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className={cn(
              "rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white",
              "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-600 active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:focus-visible:ring-offset-gray-950"
            )}
          >
            {t("tryAgain")}
          </button>
        </div>
      )}

      {/* Results grid */}
      {!error && (isLoading || results.length > 0) && (
        <>
          {/* Trending label when showing default featured results */}
          {isFeatured && !isLoading && results.length > 0 && (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <TrendingIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:text-white/30">
                {t("trendingNow")}
              </h2>
            </div>
          )}

          {isLoading ? (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5"
              role="list"
              aria-label={t("loadingResults")}
            >
              <SongsSkeleton count={10} />
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5"
              role="list"
              aria-label={isFeatured ? t("featuredTracks") : t("searchResults")}
            >
              {results.map((result, index) => (
                <motion.div
                  key={result.trackId}
                  role="listitem"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring" as const,
                    stiffness: 80,
                    damping: 20,
                    delay: (index % PAGE_SIZE) * 0.04,
                  }}
                >
                  <SongsTrackCard
                    result={result}
                    allResults={results}
                    onAuthRequired={requestAuth}
                    onAddToPlaylist={setAddToPlaylistTrack}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && !isFeatured && debouncedQuery && results.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
            <SearchIcon className="size-7 text-gray-300 dark:text-white/30" />
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-white/60">
            {t("noResults", { query: debouncedQuery })}
          </p>
          <p className="mt-1.5 text-sm text-gray-400 dark:text-white/30">{t("noResultsHint")}</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && !isFeatured && !isLoading && results.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className={cn(
              "rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white",
              "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-600 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:focus-visible:ring-offset-gray-950"
            )}
          >
            {isLoadingMore ? t("loading") : t("loadMore")}
          </button>
        </div>
      )}

      {/* Add to playlist popup */}
      <AddToPlaylistPopup track={addToPlaylistTrack} onClose={() => setAddToPlaylistTrack(null)} />
    </div>
  )
}
