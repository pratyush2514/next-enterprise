import { Metadata } from "next"

import type { AppPreviewData, PreviewPoster } from "components/Landing/AppPreview"
import { LandingPage } from "components/Landing/LandingPage"

export const metadata: Metadata = {
  title: "Melodix | It is time for the next tune",
  description:
    "Melodix provides curated music channels for bars, restaurants, stores, and businesses. Discover the perfect soundtrack for your space.",
  openGraph: {
    title: "Melodix | It is time for the next tune",
    description: "Melodix provides curated music channels for bars, restaurants, stores, and businesses.",
  },
}

export const revalidate = 86400

interface ITunesTrack {
  trackName: string
  artistName: string
  artworkUrl100: string
}

async function fetchPosters(term: string, limit: number): Promise<PreviewPoster[]> {
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

export default async function HomePage() {
  const [quickStart, mood, discover, nowPlayingArr] = await Promise.all([
    fetchPosters("pop hits", 4),
    fetchPosters("lounge jazz", 4),
    fetchPosters("indie folk", 5),
    fetchPosters("classic rock", 1),
  ])

  const previewData: AppPreviewData = {
    quickStart,
    mood,
    discover,
    nowPlaying: nowPlayingArr[0] ?? null,
  }

  return <LandingPage previewData={previewData} />
}
