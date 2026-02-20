/** Shared type for poster artwork returned by the iTunes API */
export interface PreviewPoster {
  trackName: string
  artistName: string
  artworkUrl: string
}

/** Named constants for poster genre search terms */
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
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&limit=${limit}&media=music&entity=song`
    const res = await fetch(url, { next: { revalidate: 86400 } })
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
