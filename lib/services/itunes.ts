import type { PreviewPoster } from "components/Landing/AppPreview"

import { env } from "../../env.mjs"

/** Named constants for genre search terms used on the landing page */
export const POSTER_GENRES = {
  quickStart: "pop hits",
  mood: "lounge jazz",
  discover: "indie folk",
  nowPlaying: "classic rock",
} as const

interface ITunesTrack {
  trackName: string
  artistName: string
  artworkUrl100: string
}

/** Fetch poster artwork from the iTunes Search API */
export async function fetchPosters(term: string, limit: number): Promise<PreviewPoster[]> {
  try {
    const url = new URL(env.ITUNES_API_URL)
    url.searchParams.set("term", term)
    url.searchParams.set("limit", limit.toString())
    url.searchParams.set("media", "music")
    url.searchParams.set("entity", "song")

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const data = (await res.json()) as { results: ITunesTrack[] }
    return (data.results ?? [])
      .filter((t) => t.trackName && t.artistName && t.artworkUrl100)
      .map((t) => ({
        trackName: t.trackName,
        artistName: t.artistName,
        artworkUrl: t.artworkUrl100.replace("100x100", "300x300"),
      }))
  } catch {
    return []
  }
}
