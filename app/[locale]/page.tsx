import { setRequestLocale } from "next-intl/server"

import { AppPreview } from "components/Landing/AppPreview"
import { HeroSection } from "components/Landing/HeroSection"
import { Navbar } from "components/Landing/Navbar"

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
