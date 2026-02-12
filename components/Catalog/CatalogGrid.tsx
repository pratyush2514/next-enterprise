"use client"

import { useState } from "react"

import { AudioPreviewProvider } from "hooks/useAudioPreview"
import { useCatalogSearch } from "hooks/useCatalogSearch"
import { useDebounce } from "hooks/useDebounce"
import { cn } from "lib/utils"

import { CatalogCard } from "./CatalogCard"
import { CatalogSearch } from "./CatalogSearch"
import { CatalogSkeleton } from "./CatalogSkeleton"

export function CatalogGrid() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const { results, isLoading, isLoadingMore, error, hasMore, loadMore } = useCatalogSearch(debouncedQuery)

  return (
    <div className="mx-auto max-w-(--breakpoint-xl) px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Music Catalog</h1>
        <p className="text-gray-500 dark:text-gray-400">Search the iTunes music library</p>
        <CatalogSearch value={query} onChange={setQuery} />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-4 py-12 text-center" role="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-12 w-12 text-red-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setQuery((q) => q + " ")}
            className={cn(
              "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white",
              "hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            )}
          >
            Try again
          </button>
        </div>
      )}

      {/* Results grid */}
      {!error && (isLoading || results.length > 0) && (
        <AudioPreviewProvider>
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            role="list"
            aria-label="Search results"
          >
            {isLoading ? (
              <CatalogSkeleton count={10} />
            ) : (
              results.map((result) => (
                <div key={result.trackId} role="listitem">
                  <CatalogCard result={result} />
                </div>
              ))
            )}
          </div>
        </AudioPreviewProvider>
      )}

      {/* Empty state */}
      {!isLoading && !error && debouncedQuery && results.length === 0 && (
        <div className="py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="mt-4 text-gray-500 dark:text-gray-400">No results found for &ldquo;{debouncedQuery}&rdquo;</p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Try searching for an artist, song, or album name
          </p>
        </div>
      )}

      {/* Initial state */}
      {!isLoading && !error && !debouncedQuery && results.length === 0 && (
        <div className="py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
            />
          </svg>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Search for music to get started</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && results.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className={cn(
              "rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white",
              "hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            )}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}
