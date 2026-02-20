import React from "react"
import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AudioPreviewProvider, useAudioPreview } from "./useAudioPreview"

// Mock HTMLAudioElement
function createMockAudio() {
  const listeners: Record<string, Array<() => void>> = {}

  return {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn((event: string, handler: () => void) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event]?.push(handler)
    }),
    removeEventListener: vi.fn((event: string, handler: () => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event]?.filter((h) => h !== handler) ?? []
      }
    }),
    currentTime: 0,
    duration: 30,
    src: "",
    preload: "none",
    // Helper to fire events in tests
    _fireEvent: (event: string) => {
      listeners[event]?.forEach((h) => h())
    },
    _listeners: listeners,
  }
}

let mockAudio: ReturnType<typeof createMockAudio>

beforeEach(() => {
  mockAudio = createMockAudio()
  vi.stubGlobal(
    "Audio",
    vi.fn(() => mockAudio)
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

function wrapper({ children }: { children: React.ReactNode }) {
  return <AudioPreviewProvider>{children}</AudioPreviewProvider>
}

describe("useAudioPreview", () => {
  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useAudioPreview())
    }).toThrow("useAudioPreview must be used within an AudioPreviewProvider")
  })

  it("initializes with idle state", () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })
    expect(result.current.activeTrackId).toBeNull()
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentTime).toBe(0)
    expect(result.current.duration).toBe(0)
  })

  it("play sets activeTrackId and isPlaying", async () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })

    await act(async () => {
      result.current.play(1, "https://example.com/preview.m4a")
    })

    expect(result.current.activeTrackId).toBe(1)
    expect(result.current.isPlaying).toBe(true)
    expect(mockAudio.src).toBe("https://example.com/preview.m4a")
    expect(mockAudio.load).toHaveBeenCalled()
    expect(mockAudio.play).toHaveBeenCalled()
  })

  it("play with different track stops previous and starts new", async () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })

    await act(async () => {
      result.current.play(1, "https://example.com/track1.m4a")
    })

    expect(result.current.activeTrackId).toBe(1)

    await act(async () => {
      result.current.play(2, "https://example.com/track2.m4a")
    })

    expect(result.current.activeTrackId).toBe(2)
    expect(mockAudio.pause).toHaveBeenCalled()
    expect(mockAudio.src).toBe("https://example.com/track2.m4a")
  })

  it("pause stops playback", async () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })

    await act(async () => {
      result.current.play(1, "https://example.com/preview.m4a")
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPlaying).toBe(false)
    expect(mockAudio.pause).toHaveBeenCalled()
  })

  it("toggle alternates between play and pause", async () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })

    // First toggle → play
    await act(async () => {
      result.current.toggle(1, "https://example.com/preview.m4a")
    })

    expect(result.current.isPlaying).toBe(true)

    // Second toggle → pause
    act(() => {
      result.current.toggle(1, "https://example.com/preview.m4a")
    })

    expect(result.current.isPlaying).toBe(false)
  })

  it("seek updates currentTime", async () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })

    await act(async () => {
      result.current.play(1, "https://example.com/preview.m4a")
    })

    act(() => {
      result.current.seek(15)
    })

    expect(result.current.currentTime).toBe(15)
    expect(mockAudio.currentTime).toBe(15)
  })

  it("ended event resets playback state", async () => {
    const { result } = renderHook(() => useAudioPreview(), { wrapper })

    await act(async () => {
      result.current.play(1, "https://example.com/preview.m4a")
    })

    expect(result.current.isPlaying).toBe(true)

    act(() => {
      mockAudio._fireEvent("ended")
    })

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.currentTime).toBe(0)
  })

  it("cleans up audio on unmount", () => {
    const { unmount } = renderHook(() => useAudioPreview(), { wrapper })

    unmount()

    expect(mockAudio.pause).toHaveBeenCalled()
    expect(mockAudio.removeEventListener).toHaveBeenCalled()
  })
})
