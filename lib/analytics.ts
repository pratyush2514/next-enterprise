import { getPostHog } from "lib/posthog"

// ── Event name constants ─────────────────────────────────────────────
const EVENT = {
  SEARCH: "search",
  ITEM_SELECTED: "item_selected",
  THEME_SWITCH: "theme_switch",
  CTA_CLICKED: "cta_clicked",
  NAV_CTA_CLICKED: "nav_cta_clicked",
  FAQ_EXPANDED: "faq_expanded",
  TRACK_PREVIEW_STARTED: "track_preview_started",
  TRACK_EXTERNAL_LINK_CLICKED: "track_external_link_clicked",
  LOAD_MORE_CLICKED: "load_more_clicked",
  SEARCH_CLEARED: "search_cleared",
  SEARCH_RETRY_CLICKED: "search_retry_clicked",
  NOT_FOUND_HOME_CLICKED: "not_found_home_clicked",
  NOT_FOUND_CATALOG_CLICKED: "not_found_catalog_clicked",
  SOCIAL_LINK_CLICKED: "social_link_clicked",
  APP_STORE_CLICKED: "app_store_clicked",
  DETAIL_VIEWED: "detail_viewed",
  FAVORITE_TOGGLED: "favorite_toggled",
} as const

// ── Typed event payloads ─────────────────────────────────────────────
interface SearchPayload {
  query: string
  result_count: number
}

interface ItemSelectedPayload {
  track_id: number
  track_name: string
  artist_name: string
  source: "hover_play" | "click" | "keyboard"
}

interface ThemeSwitchPayload {
  from: string
  to: string
}

interface CtaClickedPayload {
  location: "hero" | "cta_banner" | "navbar"
  destination: string
}

interface FaqExpandedPayload {
  question_id: string
  question: string
}

interface TrackPreviewStartedPayload {
  track_id: number
  track_name: string
  artist_name: string
}

interface TrackExternalLinkClickedPayload {
  track_id: number
  track_name: string
  artist_name: string
  url: string
}

interface LoadMoreClickedPayload {
  current_count: number
  query: string
}

interface SearchClearedPayload {
  previous_query: string
}

interface NotFoundClickedPayload {
  destination: "home" | "catalog"
}

interface SocialLinkClickedPayload {
  platform: string
}

interface AppStoreClickedPayload {
  store: "app_store" | "google_play"
}

interface DetailViewedPayload {
  track_id: number
  track_name: string
  artist_name: string
}

interface FavoriteToggledPayload {
  track_id: number
  track_name: string
  action: "add" | "remove"
}

// ── Internal capture helper ──────────────────────────────────────────
function capture(event: string, properties: Record<string, unknown>): void {
  const ph = getPostHog()
  if (!ph) return
  ph.capture(event, properties)
}

// ── Public API ───────────────────────────────────────────────────────

export function trackSearch(query: string, resultCount: number): void {
  capture(EVENT.SEARCH, { query, result_count: resultCount } satisfies SearchPayload)
}

export function trackItemSelected(
  trackId: number,
  trackName: string,
  artistName: string,
  source: ItemSelectedPayload["source"]
): void {
  capture(EVENT.ITEM_SELECTED, {
    track_id: trackId,
    track_name: trackName,
    artist_name: artistName,
    source,
  } satisfies ItemSelectedPayload)
}

export function trackThemeSwitch(from: string, to: string): void {
  capture(EVENT.THEME_SWITCH, { from, to } satisfies ThemeSwitchPayload)
}

export function trackCtaClicked(location: CtaClickedPayload["location"], destination: string): void {
  capture(EVENT.CTA_CLICKED, { location, destination } satisfies CtaClickedPayload)
}

export function trackNavCtaClicked(destination: string): void {
  capture(EVENT.NAV_CTA_CLICKED, { location: "navbar", destination } satisfies CtaClickedPayload)
}

export function trackFaqExpanded(questionId: string, question: string): void {
  capture(EVENT.FAQ_EXPANDED, { question_id: questionId, question } satisfies FaqExpandedPayload)
}

export function trackTrackPreviewStarted(trackId: number, trackName: string, artistName: string): void {
  capture(EVENT.TRACK_PREVIEW_STARTED, {
    track_id: trackId,
    track_name: trackName,
    artist_name: artistName,
  } satisfies TrackPreviewStartedPayload)
}

export function trackTrackExternalLinkClicked(
  trackId: number,
  trackName: string,
  artistName: string,
  url: string
): void {
  capture(EVENT.TRACK_EXTERNAL_LINK_CLICKED, {
    track_id: trackId,
    track_name: trackName,
    artist_name: artistName,
    url,
  } satisfies TrackExternalLinkClickedPayload)
}

export function trackLoadMoreClicked(currentCount: number, query: string): void {
  capture(EVENT.LOAD_MORE_CLICKED, { current_count: currentCount, query } satisfies LoadMoreClickedPayload)
}

export function trackSearchCleared(previousQuery: string): void {
  capture(EVENT.SEARCH_CLEARED, { previous_query: previousQuery } satisfies SearchClearedPayload)
}

export function trackSearchRetryClicked(): void {
  capture(EVENT.SEARCH_RETRY_CLICKED, {})
}

export function trackNotFoundClicked(destination: NotFoundClickedPayload["destination"]): void {
  capture(EVENT.NOT_FOUND_HOME_CLICKED, { destination } satisfies NotFoundClickedPayload)
}

export function trackSocialLinkClicked(platform: string): void {
  capture(EVENT.SOCIAL_LINK_CLICKED, { platform } satisfies SocialLinkClickedPayload)
}

export function trackAppStoreClicked(store: AppStoreClickedPayload["store"]): void {
  capture(EVENT.APP_STORE_CLICKED, { store } satisfies AppStoreClickedPayload)
}

export function trackDetailViewed(trackId: number, trackName: string, artistName: string): void {
  capture(EVENT.DETAIL_VIEWED, {
    track_id: trackId,
    track_name: trackName,
    artist_name: artistName,
  } satisfies DetailViewedPayload)
}

export function trackFavoriteToggled(trackId: number, trackName: string, action: "add" | "remove"): void {
  capture(EVENT.FAVORITE_TOGGLED, {
    track_id: trackId,
    track_name: trackName,
    action,
  } satisfies FavoriteToggledPayload)
}
