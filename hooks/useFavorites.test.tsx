import { act, renderHook } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { FavoritesProvider, useFavorites } from "./useFavorites"

const mockTrack = {
  trackId: 123,
  trackName: "Test Song",
  artistName: "Test Artist",
  artworkUrl100: "https://example.com/art.jpg",
}

const mockTrack2 = {
  trackId: 456,
  trackName: "Another Song",
  artistName: "Another Artist",
  artworkUrl100: "https://example.com/art2.jpg",
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>
}

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("starts with empty favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    expect(result.current.favorites).toEqual([])
    expect(result.current.count).toBe(0)
  })

  it("adds a favorite", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.toggleFavorite(mockTrack)
    })

    expect(result.current.isFavorite(123)).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it("removes a favorite on second toggle", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.toggleFavorite(mockTrack)
    })
    expect(result.current.isFavorite(123)).toBe(true)

    act(() => {
      result.current.toggleFavorite(mockTrack)
    })
    expect(result.current.isFavorite(123)).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it("manages multiple favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.toggleFavorite(mockTrack)
      result.current.toggleFavorite(mockTrack2)
    })

    expect(result.current.isFavorite(123)).toBe(true)
    expect(result.current.isFavorite(456)).toBe(true)
    expect(result.current.count).toBe(2)
  })

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.toggleFavorite(mockTrack)
    })

    const stored = JSON.parse(localStorage.getItem("melodix-favorites") ?? "[]")
    expect(stored).toHaveLength(1)
    expect(stored[0].trackId).toBe(123)
  })

  it("loads from localStorage on mount", () => {
    localStorage.setItem("melodix-favorites", JSON.stringify([mockTrack]))

    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current.isFavorite(123)).toBe(true)
    expect(result.current.count).toBe(1)
  })

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useFavorites())
    }).toThrow("useFavorites must be used within a FavoritesProvider")
  })
})
