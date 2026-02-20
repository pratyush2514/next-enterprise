import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import type { AppPreviewData } from "components/Landing/AppPreview"
import { AppPreview } from "components/Landing/AppPreview"
import { CtaBanner } from "components/Landing/CtaBanner"
import { FaqSection } from "components/Landing/FaqSection"
import { Footer } from "components/Landing/Footer"
import { HeroSection } from "components/Landing/HeroSection"
import { Navbar } from "components/Landing/Navbar"
import { SocialProof } from "components/Landing/SocialProof"
import { ValueSection } from "components/Landing/ValueSection"
import { fetchPosters, POSTER_GENRES } from "lib/services/itunes"

export const metadata: Metadata = {
  title: "melodix | It is time for the next tune",
  description:
    "Melodix provides curated music channels for bars, restaurants, stores, and businesses. Discover the perfect soundtrack for your space.",
  openGraph: {
    title: "melodix | It is time for the next tune",
    description: "Melodix provides curated music channels for bars, restaurants, stores, and businesses.",
  },
}

export const revalidate = 86400

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [quickStart, mood, discover, nowPlayingArr] = await Promise.all([
    fetchPosters(POSTER_GENRES.quickStart, 4),
    fetchPosters(POSTER_GENRES.mood, 4),
    fetchPosters(POSTER_GENRES.discover, 5),
    fetchPosters(POSTER_GENRES.nowPlaying, 1),
  ])

  const previewData: AppPreviewData = {
    quickStart,
    mood,
    discover,
    nowPlaying: nowPlayingArr[0] ?? null,
  }

  return (
    <main>
      <Navbar />
      <HeroSection />
      <AppPreview data={previewData} />
      <SocialProof />
      <ValueSection />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}
