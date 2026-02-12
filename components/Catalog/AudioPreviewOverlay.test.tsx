import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import type { ITunesResult } from "hooks/useCatalogSearch"

// Mock window.matchMedia (not available in jsdom)
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock the audio preview context
const mockToggle = vi.fn()
const mockSeek = vi.fn()
const mockState = {
  activeTrackId: null as number | null,
  isPlaying: false,
  currentTime: 0,
  duration: 30,
  play: vi.fn(),
  pause: vi.fn(),
  toggle: mockToggle,
  seek: mockSeek,
}

vi.mock("hooks/useAudioPreview", () => ({
  useAudioPreview: () => mockState,
  AudioPreviewProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock framer-motion to avoid animation complexity in tests
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
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { AudioPreviewOverlay } from "./AudioPreviewOverlay"

const mockResult: ITunesResult = {
  trackId: 1,
  trackName: "Test Song",
  artistName: "Test Artist",
  collectionName: "Test Album",
  artworkUrl100: "https://example.com/art.jpg",
  trackPrice: 1.29,
  currency: "USD",
  primaryGenreName: "Pop",
  trackViewUrl: "https://itunes.apple.com/track/1",
  previewUrl: "https://example.com/preview.m4a",
}

describe("AudioPreviewOverlay", () => {
  it("renders track name and artist", () => {
    render(<AudioPreviewOverlay result={mockResult} />)
    expect(screen.getByText("Test Song")).toBeInTheDocument()
    expect(screen.getByText("Test Artist")).toBeInTheDocument()
  })

  it("renders play button when not playing", () => {
    mockState.activeTrackId = null
    mockState.isPlaying = false
    render(<AudioPreviewOverlay result={mockResult} />)
    expect(screen.getByLabelText("Play preview")).toBeInTheDocument()
  })

  it("renders pause button when this track is playing", () => {
    mockState.activeTrackId = 1
    mockState.isPlaying = true
    render(<AudioPreviewOverlay result={mockResult} />)
    expect(screen.getByLabelText("Pause preview")).toBeInTheDocument()
  })

  it("calls toggle when play button is clicked", () => {
    mockState.activeTrackId = null
    mockState.isPlaying = false
    render(<AudioPreviewOverlay result={mockResult} />)
    fireEvent.click(screen.getByLabelText("Play preview"))
    expect(mockToggle).toHaveBeenCalledWith(1, "https://example.com/preview.m4a")
  })

  it("renders progress bar with correct aria attributes", () => {
    mockState.activeTrackId = 1
    mockState.isPlaying = true
    mockState.currentTime = 10
    mockState.duration = 30
    render(<AudioPreviewOverlay result={mockResult} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("aria-valuenow", "10")
    expect(slider).toHaveAttribute("aria-valuemax", "30")
  })

  it("has accessible region role and label", () => {
    render(<AudioPreviewOverlay result={mockResult} />)
    expect(screen.getByRole("region")).toHaveAttribute("aria-label", "Audio preview for Test Song")
  })

  it("renders iTunes store link", () => {
    render(<AudioPreviewOverlay result={mockResult} />)
    const link = screen.getByLabelText("Open Test Song in iTunes Store")
    expect(link).toHaveAttribute("href", "https://itunes.apple.com/track/1")
    expect(link).toHaveAttribute("target", "_blank")
  })
})
