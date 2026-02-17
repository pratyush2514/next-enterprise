import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock framer-motion to avoid animation issues in tests
const MOTION_PROPS = new Set([
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileInView",
  "whileDrag",
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "layout",
  "layoutId",
  "onAnimationStart",
  "onAnimationComplete",
])

function filterMotionProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROPS.has(key)) filtered[key] = value
  }
  return filtered
}

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      heading: "Music Catalog",
      subtext: "Search millions of tracks. Hover to preview. Discover your sound.",
      searchLabel: "Search music catalog",
      searchPlaceholder: "Search for music...",
      clearSearch: "Clear search",
      tryAgain: "Try again",
      trendingNow: "Trending Now",
      noResultsHint: "Try searching for an artist, song, or album name",
      loadMore: "Load more",
      loading: "Loading...",
      loadingResults: "Loading results",
      featuredTracks: "Featured tracks",
      searchResults: "Search results",
      noPreview: "No preview",
    }
    return (key: string, params?: Record<string, string>) => {
      if (key === "noResults" && params?.query) return `No results for \u201c${params.query}\u201d`
      return translations[key] ?? key
    }
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(function MockMotionDiv(
      { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
      ref: React.Ref<HTMLDivElement>
    ) {
      return (
        <div ref={ref} {...filterMotionProps(props)}>
          {children}
        </div>
      )
    }),
    g: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <g {...filterMotionProps(props)}>{children}</g>
    ),
    path: (props: Record<string, unknown>) => <path {...filterMotionProps(props)} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
}))

import { FavoritesProvider } from "hooks/useFavorites"

import { CatalogGrid } from "./CatalogGrid"

function WrappedCatalogGrid() {
  return (
    <FavoritesProvider>
      <CatalogGrid />
    </FavoritesProvider>
  )
}

const mockResults = {
  resultCount: 2,
  results: [
    {
      trackId: 1,
      trackName: "Test Song",
      artistName: "Test Artist",
      collectionName: "Test Album",
      artworkUrl100: "https://example.com/art100.jpg",
      trackPrice: 1.29,
      currency: "USD",
      primaryGenreName: "Pop",
      trackViewUrl: "https://itunes.apple.com/track/1",
      previewUrl: "https://example.com/preview1.m4a",
    },
    {
      trackId: 2,
      trackName: "Another Song",
      artistName: "Another Artist",
      collectionName: "Another Album",
      artworkUrl100: "https://example.com/art200.jpg",
      trackPrice: 0.99,
      currency: "USD",
      primaryGenreName: "Rock",
      trackViewUrl: "https://itunes.apple.com/track/2",
    },
  ],
}

const featuredResults = {
  resultCount: 2,
  results: [
    {
      trackId: 100,
      trackName: "Trending Hit",
      artistName: "Popular Artist",
      collectionName: "Hot Album",
      artworkUrl100: "https://example.com/art100.jpg",
      trackPrice: 1.29,
      currency: "USD",
      primaryGenreName: "Pop",
      trackViewUrl: "https://example.com",
      previewUrl: "https://example.com/preview.m4a",
    },
    {
      trackId: 101,
      trackName: "Chart Topper",
      artistName: "Famous Singer",
      collectionName: "Platinum LP",
      artworkUrl100: "https://example.com/art101.jpg",
      trackPrice: 0.99,
      currency: "USD",
      primaryGenreName: "R&B",
      trackViewUrl: "https://example.com",
    },
  ],
}

describe("CatalogGrid", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // Default fetch mock — returns empty for any call unless overridden
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })
    )

    // Mock Audio for AudioPreviewProvider
    vi.stubGlobal(
      "Audio",
      vi.fn(() => ({
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        load: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        currentTime: 0,
        duration: 0,
        src: "",
        preload: "none",
      }))
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("fetches and displays trending tracks on initial load", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => featuredResults,
    })

    render(<WrappedCatalogGrid />)

    await waitFor(() => {
      expect(screen.getByText("Trending Hit")).toBeInTheDocument()
      expect(screen.getByText("Popular Artist")).toBeInTheDocument()
    })

    expect(screen.getByText("Trending Now")).toBeInTheDocument()
    expect(screen.getByLabelText("Featured tracks")).toBeInTheDocument()
  })

  it("displays results after successful search", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      })

    render(<WrappedCatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText("Test Song")).toBeInTheDocument()
      expect(screen.getByText("Test Artist")).toBeInTheDocument()
    })
  })

  it("shows no-preview badge for tracks without previewUrl", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      })

    render(<WrappedCatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText("No preview")).toBeInTheDocument()
    })
  })

  it("shows empty state for no results", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })

    render(<WrappedCatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "xyznonexistent" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText(/no results for/i)).toBeInTheDocument()
    })
  })

  it("shows error state on network failure", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })
      .mockRejectedValueOnce(new Error("Network error"))

    render(<WrappedCatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
  })

  it("clears search with clear button", async () => {
    render(<WrappedCatalogGrid />)

    // Wait for initial featured fetch to settle
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    const input = screen.getByRole("searchbox")
    fireEvent.change(input, { target: { value: "test" } })

    const clearButton = screen.getByLabelText("Clear search")
    fireEvent.click(clearButton)

    expect(input).toHaveValue("")
  })

  it("displays additional results after load more", async () => {
    // First call: initial featured fetch (empty)
    // Second call: search page 1 (20 results → triggers hasMore)
    // Third call: search page 2
    const page1Results = Array.from({ length: 20 }, (_, i) => ({
      trackId: i + 1,
      trackName: `Song ${i + 1}`,
      artistName: `Artist ${i + 1}`,
      collectionName: `Album ${i + 1}`,
      artworkUrl100: `https://example.com/art${i + 1}.jpg`,
      trackPrice: 1.29,
      currency: "USD",
      primaryGenreName: "Pop",
      trackViewUrl: `https://itunes.apple.com/track/${i + 1}`,
      previewUrl: `https://example.com/preview${i + 1}.m4a`,
    }))

    const page2Results = [
      {
        trackId: 21,
        trackName: "New Song 21",
        artistName: "New Artist 21",
        collectionName: "New Album 21",
        artworkUrl100: "https://example.com/art21.jpg",
        trackPrice: 0.99,
        currency: "USD",
        primaryGenreName: "Rock",
        trackViewUrl: "https://itunes.apple.com/track/21",
        previewUrl: "https://example.com/preview21.m4a",
      },
    ]

    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 20, results: page1Results }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resultCount: 1, results: page2Results }),
      })

    render(<WrappedCatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText("Song 1")).toBeInTheDocument()
    })

    // Click Load More
    const loadMoreButton = screen.getByText("Load more")
    await act(async () => {
      fireEvent.click(loadMoreButton)
    })

    await waitFor(() => {
      expect(screen.getByText("New Song 21")).toBeInTheDocument()
      expect(screen.getByText("New Artist 21")).toBeInTheDocument()
    })
  })
})
