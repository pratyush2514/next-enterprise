# ADR-002: Day 4 Performance Notes

## Status

Accepted

## Context

Day 4 adds track detail pages, a favorites system, and E2E test coverage. This document records the performance decisions made during implementation.

## Decisions

### 1. Server-Side Data Fetching for Detail Pages

The track detail page (`app/catalog/[id]/page.tsx`) is a **Server Component** that fetches data directly from the iTunes API at request time with ISR caching (`revalidate: 3600`).

**Why:** Deep links (`/catalog/12345`) render the full page server-side with no client-side fetch waterfall. The browser receives complete HTML including track metadata, artwork URL, and OG tags. This eliminates the loading spinner pattern where the page loads, then JavaScript runs, then an API call fires, then content appears.

**Impact:** First Contentful Paint (FCP) and Largest Contentful Paint (LCP) are significantly faster for direct navigation / shared links. Search engines see full content without JavaScript execution.

### 2. Dynamic Import for AudioPreviewOverlay

`AudioPreviewOverlay` is loaded via `next/dynamic` with `ssr: false` in `CatalogCard.tsx`.

**Why:** The overlay is only visible when a user hovers a card with an available preview. By code-splitting it from the main catalog bundle, the initial page load ships less JavaScript. The overlay module (including its LiquidGlass sub-components) loads on demand when first needed.

**Impact:** Reduces initial JS bundle size for `/catalog`. The overlay loads lazily on first hover interaction.

### 3. Image Priority on Detail Page

The hero artwork image on the detail page uses `priority` attribute via `next/image`.

**Why:** The artwork is the LCP element on the detail page. Setting `priority` tells Next.js to preload it (via `<link rel="preload">`), removing it from the lazy-loading queue.

**Impact:** Faster LCP on detail page loads.

### 4. Optimistic Favorites with localStorage

Favorites use in-memory React state as the source of truth during a session, synced to `localStorage` on every toggle.

**Why:** `localStorage.setItem` is synchronous, so there's no async gap between the user action and the state update. The heart icon toggles instantly. No network requests are needed — all data is local.

**Impact:** Zero-latency UI feedback for favorite toggles. No loading states or error recovery needed for the favorites interaction.

## Performance Checklist

- [x] Detail pages render server-side (no client fetch waterfall)
- [x] Dynamic import for AudioPreviewOverlay (code splitting)
- [x] Priority image on detail page LCP element
- [x] Optimistic state updates for favorites
- [x] ISR caching (1 hour) for track lookups
- [x] Proper `sizes` attribute on all `next/image` instances
