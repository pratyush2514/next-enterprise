import { useFeatureFlagEnabled } from "posthog-js/react"

export type FeatureFlagName = "new-catalog-layout" | "ai-summaries"

/**
 * Returns whether a feature flag is enabled.
 * Falls back to `defaultValue` when PostHog is unavailable (dev, tests, DNT).
 */
export function useFeatureFlag(flag: FeatureFlagName, defaultValue = false): boolean {
  const enabled = useFeatureFlagEnabled(flag)
  if (typeof enabled === "undefined") return defaultValue
  return enabled
}
