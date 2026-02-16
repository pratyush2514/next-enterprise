import { beforeEach, describe, expect, it, vi } from "vitest"

const mockCapture = vi.fn()

vi.mock("lib/posthog", () => ({
  getPostHog: () => ({ capture: mockCapture }),
}))

import { trackItemSelected, trackSearch, trackThemeSwitch } from "./analytics"

describe("analytics", () => {
  beforeEach(() => {
    mockCapture.mockClear()
  })

  it("trackSearch captures event with correct payload", () => {
    trackSearch("jazz", 15)
    expect(mockCapture).toHaveBeenCalledWith("search", {
      query: "jazz",
      result_count: 15,
    })
  })

  it("trackItemSelected captures event with correct payload", () => {
    trackItemSelected(123, "Blue Train", "John Coltrane", "hover_play")
    expect(mockCapture).toHaveBeenCalledWith("item_selected", {
      track_id: 123,
      track_name: "Blue Train",
      artist_name: "John Coltrane",
      source: "hover_play",
    })
  })

  it("trackThemeSwitch captures event with correct payload", () => {
    trackThemeSwitch("light", "dark")
    expect(mockCapture).toHaveBeenCalledWith("theme_switch", {
      from: "light",
      to: "dark",
    })
  })
})

describe("analytics (PostHog unavailable)", () => {
  it("does not throw when PostHog is null", () => {
    vi.doMock("lib/posthog", () => ({
      getPostHog: () => null,
    }))
    expect(() => trackSearch("test", 0)).not.toThrow()
  })
})
