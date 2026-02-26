import React from "react"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock lib/supabase/client to prevent env.mjs validation in test env
vi.mock("lib/supabase/client", () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
    insert: vi.fn().mockResolvedValue({ error: null }),
  }))

  return {
    createClient: () => ({
      from: mockFrom,
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    }),
  }
})

// Mock useSession to simulate authenticated user
vi.mock("hooks/useSession", () => ({
  useSession: () => ({
    user: { id: "test-user-123", email: "test@example.com" },
    status: "authenticated",
    isAuthenticated: true,
    isLoading: false,
  }),
}))

// Mock auth context
vi.mock("lib/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "test@example.com" },
    profile: null,
    loading: false,
    error: null,
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

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
    vi.restoreAllMocks()
  })

  it("starts with empty favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })
    expect(result.current.favorites).toEqual([])
    expect(result.current.count).toBe(0)
  })

  it("adds a favorite optimistically", () => {
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

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useFavorites())
    }).toThrow("useFavorites must be used within a FavoritesProvider")
  })
})
