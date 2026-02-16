import { useFeatureFlagVariantKey } from "posthog-js/react"

import type { FeatureFlagName } from "./useFeatureFlag"

export type CatalogLayoutVariant = "control" | "compact"
export type AiSummariesVariant = "control" | "enabled"

type VariantMap = {
  "new-catalog-layout": CatalogLayoutVariant
  "ai-summaries": AiSummariesVariant
}

/**
 * Returns the variant key for an A/B experiment.
 * Falls back to `defaultVariant` when PostHog is unavailable.
 */
export function useExperimentVariant<F extends FeatureFlagName>(flag: F, defaultVariant: VariantMap[F]): VariantMap[F] {
  const variant = useFeatureFlagVariantKey(flag)
  if (typeof variant !== "string") return defaultVariant
  return variant as VariantMap[F]
}
