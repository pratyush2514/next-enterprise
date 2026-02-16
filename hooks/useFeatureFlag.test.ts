import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mockUseFeatureFlagEnabled = vi.fn()
const mockUseFeatureFlagVariantKey = vi.fn()

vi.mock("posthog-js/react", () => ({
  useFeatureFlagEnabled: (...args: unknown[]) => mockUseFeatureFlagEnabled(...args),
  useFeatureFlagVariantKey: (...args: unknown[]) => mockUseFeatureFlagVariantKey(...args),
}))

import { useExperimentVariant } from "./useExperimentVariant"
import { useFeatureFlag } from "./useFeatureFlag"

describe("useFeatureFlag", () => {
  it("returns defaultValue (false) when PostHog returns undefined", () => {
    mockUseFeatureFlagEnabled.mockReturnValue(undefined)
    const { result } = renderHook(() => useFeatureFlag("new-catalog-layout"))
    expect(result.current).toBe(false)
  })

  it("returns true when flag is enabled", () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    const { result } = renderHook(() => useFeatureFlag("ai-summaries"))
    expect(result.current).toBe(true)
  })

  it("returns custom default when PostHog is unavailable", () => {
    mockUseFeatureFlagEnabled.mockReturnValue(undefined)
    const { result } = renderHook(() => useFeatureFlag("ai-summaries", true))
    expect(result.current).toBe(true)
  })
})

describe("useExperimentVariant", () => {
  it("returns default variant when PostHog returns undefined", () => {
    mockUseFeatureFlagVariantKey.mockReturnValue(undefined)
    const { result } = renderHook(() => useExperimentVariant("new-catalog-layout", "control"))
    expect(result.current).toBe("control")
  })

  it("returns actual variant when PostHog returns a string", () => {
    mockUseFeatureFlagVariantKey.mockReturnValue("compact")
    const { result } = renderHook(() => useExperimentVariant("new-catalog-layout", "control"))
    expect(result.current).toBe("compact")
  })
})
