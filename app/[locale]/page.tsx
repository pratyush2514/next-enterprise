import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { AppPreview } from "components/Landing/AppPreview"
import { HeroSection } from "components/Landing/HeroSection"
import { Navbar } from "components/Landing/Navbar"

export const metadata: Metadata = {
  title: "melodix | It is time for the next tune",
  description: "Search millions of tracks, preview on hover, and discover your next favorite song.",
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main>
      <Navbar />
      <HeroSection />
      <AppPreview />
    </main>
  )
}
