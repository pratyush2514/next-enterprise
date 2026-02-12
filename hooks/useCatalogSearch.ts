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

const LIMIT = 20

export function useCatalogSearch(debouncedTerm: string) {
  const [state, setState] = useState<CatalogSearchState>({
    results: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
  })
  const abortControllerRef = useRef<AbortController | null>(null)
  const offsetRef = useRef(0)

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setState({ results: [], isLoading: false, isLoadingMore: false, error: null, hasMore: false })
      return
    }

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    offsetRef.current = 0

    const fetchResults = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, results: [] }))

      try {
        const url = `/api/itunes?term=${encodeURIComponent(debouncedTerm)}&limit=${LIMIT}&offset=0`
        const response = await fetch(url, { signal: controller.signal })

        if (!response.ok) throw new Error("Failed to fetch results")

        const data = (await response.json()) as ITunesResponse
        const results = data.results ?? []

        setState({
          results,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          hasMore: results.length === LIMIT,
        })
        offsetRef.current = results.length
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "An unexpected error occurred",
        }))
      }
    }

    fetchResults()

    return () => {
      controller.abort()
    }
  }, [debouncedTerm])

  const loadMore = useCallback(async () => {
    if (state.isLoadingMore || !state.hasMore) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setState((prev) => ({ ...prev, isLoadingMore: true, error: null }))

    try {
      const url = `/api/itunes?term=${encodeURIComponent(debouncedTerm)}&limit=${LIMIT}&offset=${offsetRef.current}`
      const response = await fetch(url, { signal: controller.signal })

      if (!response.ok) throw new Error("Failed to load more results")

      const data = (await response.json()) as ITunesResponse
      const newResults = data.results ?? []

      setState((prev) => ({
        ...prev,
        results: [...prev.results, ...newResults],
        isLoadingMore: false,
        hasMore: newResults.length === LIMIT,
      }))
      offsetRef.current += newResults.length
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setState((prev) => ({
        ...prev,
        isLoadingMore: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred",
      }))
    }
  }, [debouncedTerm, state.isLoadingMore, state.hasMore])

  return { ...state, loadMore }
}
