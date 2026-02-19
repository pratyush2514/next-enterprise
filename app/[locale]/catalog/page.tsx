import { Metadata } from "next"

import { CatalogGrid } from "components/Catalog/CatalogGrid"

export const metadata: Metadata = {
  title: "Catalog | Melodix",
  description: "Search and preview millions of tracks. Discover the perfect sound for your space.",
}

export default function CatalogPage() {
  return <CatalogGrid />
}
