import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(function MockMotionDiv(
      { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
      ref: React.Ref<HTMLDivElement>
    ) {
      return (
        <div ref={ref} {...props}>
          {children}
        </div>
      )
    }),
    g: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <g {...props}>{children}</g>,
    path: (props: Record<string, unknown>) => <path {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { CatalogGrid } from "./CatalogGrid"

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

describe("CatalogGrid", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    global.fetch = vi.fn()

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

  it("renders initial empty state", () => {
    render(<CatalogGrid />)
    expect(screen.getByText("Search for music to get started")).toBeInTheDocument()
  })

  it("displays results after successful fetch", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    })

    render(<CatalogGrid />)
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
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    })

    render(<CatalogGrid />)
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
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resultCount: 0, results: [] }),
    })

    render(<CatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "xyznonexistent" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    })
  })

  it("shows error state on network failure", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"))

    render(<CatalogGrid />)
    const input = screen.getByRole("searchbox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } })
      vi.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
  })

  it("clears search with clear button", () => {
    render(<CatalogGrid />)
    const input = screen.getByRole("searchbox")
    fireEvent.change(input, { target: { value: "test" } })

    const clearButton = screen.getByLabelText("Clear search")
    fireEvent.click(clearButton)

    expect(input).toHaveValue("")
  })
})
