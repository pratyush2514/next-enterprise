"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { AudioPreviewProvider } from "hooks/useAudioPreview"
import { useCatalogSearch } from "hooks/useCatalogSearch"
import { useDebounce } from "hooks/useDebounce"
import { useExperimentVariant } from "hooks/useExperimentVariant"
import { trackLoadMoreClicked, trackSearch, trackSearchRetryClicked } from "lib/analytics"
import { cn } from "lib/utils"

import { CatalogCard } from "./CatalogCard"
import { CatalogSearch } from "./CatalogSearch"
import { CatalogSkeleton } from "./CatalogSkeleton"

const PAGE_SIZE = 20

export function CatalogGrid() {
  const [query, setQuery] = useState("")
  const [retryKey, setRetryKey] = useState(0)
  const debouncedQuery = useDebounce(query, 300)
  const { results, isLoading, isLoadingMore, error, hasMore, loadMore, isFeatured } = useCatalogSearch(
    debouncedQuery,
    retryKey
  )
  const prefersReducedMotion = useReducedMotion()
  const catalogLayout = useExperimentVariant("new-catalog-layout", "control")

  const gridClassName =
    catalogLayout === "compact"
      ? "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
      : "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"

  // ── Search event tracking ────────────────────────────────────────
  const prevQueryRef = useRef("")

  useEffect(() => {
    if (!debouncedQuery.trim() || isLoading || isFeatured) return
    if (prevQueryRef.current === debouncedQuery) return

    prevQueryRef.current = debouncedQuery
    trackSearch(debouncedQuery, results.length)
  }, [debouncedQuery, results.length, isLoading, isFeatured])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center gap-3">
        <h1 className="text-center text-3xl leading-tight font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Music Catalog
        </h1>
        <p className="max-w-md text-center text-base leading-relaxed text-gray-500 dark:text-gray-400">
          Search millions of tracks. Hover to preview. Discover your sound.
        </p>
        <div className="mt-4 w-full max-w-lg">
          <CatalogSearch value={query} onChange={setQuery} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7 text-red-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-base font-medium text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => {
              trackSearchRetryClicked()
              setRetryKey((k) => k + 1)
            }}
            className={cn(
              "rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white",
              "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-600 active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              "dark:focus-visible:ring-offset-gray-950"
            )}
          >
            Try again
          </button>
        </div>
      )}

      {/* Results grid */}
      {!error && (isLoading || results.length > 0) && (
        <AudioPreviewProvider>
          {/* Trending label when showing default featured results */}
          {isFeatured && !isLoading && results.length > 0 && (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z"
                  />
                </svg>
              </div>
              <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Trending Now
              </h2>
            </div>
          )}

          {isLoading ? (
            <div className={gridClassName} role="list" aria-label="Loading results">
              <CatalogSkeleton count={10} />
            </div>
          ) : (
            <div className={gridClassName} role="list" aria-label={isFeatured ? "Featured tracks" : "Search results"}>
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
                  <CatalogCard result={result} />
                </motion.div>
              ))}
            </div>
          )}
        </AudioPreviewProvider>
      )}

      {/* Empty state — only for explicit user searches with no results */}
      {!isLoading && !error && !isFeatured && debouncedQuery && results.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-7 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">
            No results for &ldquo;{debouncedQuery}&rdquo;
          </p>
          <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">
            Try searching for an artist, song, or album name
          </p>
        </div>
      )}

      {/* Load More — only for search results, not featured */}
      {hasMore && !isFeatured && !isLoading && results.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              trackLoadMoreClicked(results.length, debouncedQuery)
              loadMore()
            }}
            disabled={isLoadingMore}
            className={cn(
              "rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white",
              "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-600 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
              "dark:focus-visible:ring-offset-gray-950"
            )}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}
