import { env } from "../../env.mjs"

export interface ITunesSearchParams {
  term: string
  limit: number
  offset?: number
}

export interface ITunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  artworkUrl100: string
  trackPrice: number
  currency: string
  primaryGenreName: string
  trackViewUrl: string
  previewUrl?: string
}

export interface ITunesSearchResponse {
  resultCount: number
  results: ITunesTrack[]
}

/**
 * Search iTunes catalog for music tracks
 */
export async function searchITunes(params: ITunesSearchParams): Promise<ITunesSearchResponse> {
  const { term, limit, offset = 0 } = params

  const url = new URL(env.ITUNES_API_URL)
  url.searchParams.set("term", term)
  url.searchParams.set("limit", limit.toString())
  url.searchParams.set("offset", offset.toString())
  url.searchParams.set("media", "music")

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`iTunes API returned status ${response.status}`)
  }

  return (await response.json()) as ITunesSearchResponse
}
