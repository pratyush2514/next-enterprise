import { useCallback, useEffect, useRef, useState } from "react"

export interface ITunesResult {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  artworkUrl100: string
  trackPrice: number
  currency: string
  primaryGenreName: string
  trackViewUrl: string
  previewUrl?: string
}

interface ITunesResponse {
  resultCount: number
  results: ITunesResult[]
}

interface CatalogSearchState {
  results: ITunesResult[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
}

const PAGE_SIZE = 20
const MAX_LIMIT = 200
const DEFAULT_TERM = "top hits"

/**
 * Deduplicate results by trackId, preserving insertion order.
 */
function deduplicateResults(results: ITunesResult[]): ITunesResult[] {
  const seen = new Set<number>()
  return results.filter((r) => {
    if (seen.has(r.trackId)) return false
    seen.add(r.trackId)
    return true
  })
}

export function useCatalogSearch(debouncedTerm: string, retryKey: number = 0) {
  const effectiveTerm = debouncedTerm.trim() || DEFAULT_TERM
  const isFeatured = !debouncedTerm.trim()

  const [state, setState] = useState<CatalogSearchState>({
    results: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    hasMore: false,
  })
  const searchControllerRef = useRef<AbortController | null>(null)
  const loadMoreControllerRef = useRef<AbortController | null>(null)
  const nextLimitRef = useRef(PAGE_SIZE)

  // Fetch function extracted from useEffect
  const fetchResults = useCallback(
    async (controller: AbortController) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, results: [] }))

      try {
        const url = `/api/itunes?term=${encodeURIComponent(effectiveTerm)}&limit=${PAGE_SIZE}`
        const response = await fetch(url, { signal: controller.signal })

        if (!response.ok) throw new Error("Failed to fetch results")

        const data = (await response.json()) as ITunesResponse
        const results = deduplicateResults(data.results ?? [])

        setState({
          results,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          hasMore: results.length >= PAGE_SIZE && nextLimitRef.current < MAX_LIMIT,
        })
        nextLimitRef.current = PAGE_SIZE + PAGE_SIZE
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred",
        }))
      }
    },
    [effectiveTerm]
  )

  // Initial fetch — runs when search term changes
  useEffect(() => {
    searchControllerRef.current?.abort()
    loadMoreControllerRef.current?.abort()
    const controller = new AbortController()
    searchControllerRef.current = controller
    nextLimitRef.current = PAGE_SIZE

    fetchResults(controller)

    return () => {
      controller.abort()
    }
  }, [fetchResults, retryKey])

  // Load more — fetches with a larger limit and appends only new unique results
  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMore) return

    loadMoreControllerRef.current?.abort()
    const controller = new AbortController()
    loadMoreControllerRef.current = controller

    const fetchLimit = nextLimitRef.current

    setState((prev) => ({ ...prev, isLoadingMore: true, error: null }))

    try {
      const url = `/api/itunes?term=${encodeURIComponent(effectiveTerm)}&limit=${fetchLimit}`
      const response = await fetch(url, { signal: controller.signal })

      if (!response.ok) throw new Error("Failed to load more results")

      const data = (await response.json()) as ITunesResponse
      const allResults = deduplicateResults(data.results ?? [])

      setState((prev) => {
        const existingIds = new Set(prev.results.map((r) => r.trackId))
        const uniqueNew = allResults.filter((r) => !existingIds.has(r.trackId))
        const merged = [...prev.results, ...uniqueNew]
        return {
          ...prev,
          results: merged,
          isLoadingMore: false,
          hasMore: uniqueNew.length > 0 && fetchLimit < MAX_LIMIT,
        }
      })
      nextLimitRef.current = Math.min(fetchLimit + PAGE_SIZE, MAX_LIMIT)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setState((prev) => ({
        ...prev,
        isLoadingMore: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred",
      }))
    }
  }, [effectiveTerm, state.isLoadingMore, state.hasMore])

  return { ...state, loadMore, isFeatured }
}
