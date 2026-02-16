"use client"

import type { AppPreviewData } from "./AppPreview"
import { AppPreview } from "./AppPreview"
import { CtaBanner } from "./CtaBanner"
import { FaqSection } from "./FaqSection"
import { Footer } from "./Footer"
import { HeroSection } from "./HeroSection"
import { Navbar } from "./Navbar"
import { ValueSection } from "./ValueSection"

export function LandingPage({ previewData }: { previewData?: AppPreviewData }) {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <AppPreview data={previewData} />
      <ValueSection />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}
