/**
 * Palette extraction from artwork images using node-vibrant.
 * Used by FullscreenPlayer and AuthOverlay for dynamic gradient backgrounds.
 */

import { Vibrant } from "node-vibrant/browser"

export interface ExtractedPalette {
  colors: [string, string, string]
  primary: string
}

/** Structural type matching Vibrant's Swatch — avoids importing transitive @vibrant/color */
interface VibrantSwatch {
  rgb: [number, number, number]
}

interface VibrantPalette {
  Vibrant: VibrantSwatch | null
  Muted: VibrantSwatch | null
  DarkVibrant: VibrantSwatch | null
  DarkMuted: VibrantSwatch | null
  LightVibrant: VibrantSwatch | null
  LightMuted: VibrantSwatch | null
}

const FALLBACK_PALETTE: ExtractedPalette = {
  colors: ["rgb(24,24,27)", "rgb(15,15,20)", "rgb(10,10,12)"],
  primary: "rgb(24,24,27)",
}

const cache = new Map<string, Promise<ExtractedPalette>>()
const resolvedCache = new Map<string, ExtractedPalette>()

/**
 * Synchronously return a previously resolved palette, or null if not yet available.
 * Use this to initialize state without a flash of fallback colors.
 */
export function getCachedPalette(imageUrl: string): ExtractedPalette | null {
  return resolvedCache.get(imageUrl) ?? null
}

/**
 * Convert an `rgb(r,g,b)` string to `rgba(r,g,b,alpha)`.
 */
export function withAlpha(rgb: string, alpha: number): string {
  return rgb.replace("rgb(", "rgba(").replace(")", `,${alpha})`)
}

function swatchToRgb(swatch: VibrantSwatch): string {
  const [r, g, b] = swatch.rgb
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

/**
 * Extract a 3-color palette from an image URL using Vibrant.js.
 * Picks DarkVibrant, DarkMuted, and Vibrant swatches for rich,
 * contrast-safe gradient backgrounds. Results are cached by URL.
 */
export function extractPalette(imageUrl: string): Promise<ExtractedPalette> {
  if (!imageUrl) return Promise.resolve(FALLBACK_PALETTE)

  const cached = cache.get(imageUrl)
  if (cached) return cached

  const promise = (Vibrant.from(imageUrl).quality(3).getPalette() as Promise<VibrantPalette>)
    .then((palette) => {
      // Prefer darker swatches for backgrounds; fall back through the palette
      const candidates = [
        palette.DarkVibrant,
        palette.DarkMuted,
        palette.Vibrant,
        palette.Muted,
        palette.LightVibrant,
        palette.LightMuted,
      ].filter((s): s is VibrantSwatch => s !== null)

      if (candidates.length === 0) {
        resolvedCache.set(imageUrl, FALLBACK_PALETTE)
        return FALLBACK_PALETTE
      }

      const primary = swatchToRgb(candidates[0]!)
      const secondary = candidates[1] ? swatchToRgb(candidates[1]) : primary
      const tertiary = candidates[2] ? swatchToRgb(candidates[2]) : secondary

      const result: ExtractedPalette = {
        colors: [primary, secondary, tertiary] as [string, string, string],
        primary,
      }
      resolvedCache.set(imageUrl, result)
      return result
    })
    .catch(() => {
      resolvedCache.set(imageUrl, FALLBACK_PALETTE)
      return FALLBACK_PALETTE
    })

  cache.set(imageUrl, promise)
  return promise
}
