"use client"

import { Footer } from "components/Landing/Footer"
import { Navbar } from "components/Landing/Navbar"

export function CatalogShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar variant="solid" />
      <div className="min-h-screen bg-white pt-16 dark:bg-gray-950">{children}</div>
      <Footer />
    </>
  )
}
