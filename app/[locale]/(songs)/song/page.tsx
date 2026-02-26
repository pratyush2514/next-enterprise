import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { SongsGrid } from "components/Songs/SongsGrid"
import { SongsHero } from "components/Songs/SongsHero"
import { fetchPosters } from "lib/services/itunes"

export const metadata: Metadata = {
  title: "Songs | Melodix",
  description: "Discover, search, and play millions of tracks. Your complete music experience.",
}

export const revalidate = 86400

export default async function SongsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const featured = await fetchPosters("top hits", 6)

  return (
    <>
      <SongsHero featured={featured} />
      <SongsGrid />
    </>
  )
}
