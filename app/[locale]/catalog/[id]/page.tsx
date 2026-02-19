import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TrackDetail } from "components/Catalog/TrackDetail"
import type { ITunesResult } from "hooks/useCatalogSearch"

const ITUNES_LOOKUP_API = "https://itunes.apple.com/lookup"

async function fetchTrack(id: string): Promise<ITunesResult | null> {
  try {
    const url = new URL(ITUNES_LOOKUP_API)
    url.searchParams.set("id", id)

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    })

    if (!response.ok) return null

    const data = (await response.json()) as { resultCount: number; results: ITunesResult[] }
    return data.results?.[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const track = await fetchTrack(id)

  if (!track) {
    return { title: "Track Not Found | Melodix" }
  }

  return {
    title: `${track.trackName} by ${track.artistName} | Melodix`,
    description: `Listen to ${track.trackName} by ${track.artistName} from ${track.collectionName}. ${track.primaryGenreName} — available on Melodix.`,
    openGraph: {
      title: `${track.trackName} — ${track.artistName}`,
      description: `${track.collectionName} · ${track.primaryGenreName}`,
      images: [{ url: track.artworkUrl100?.replace("100x100", "600x600") ?? "" }],
    },
  }
}

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!/^\d+$/.test(id)) {
    notFound()
  }

  const track = await fetchTrack(id)

  if (!track) {
    notFound()
  }

  return <TrackDetail track={track} />
}
