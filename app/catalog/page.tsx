import { Metadata } from "next"

import { CatalogGrid } from "components/Catalog/CatalogGrid"

export const metadata: Metadata = {
  title: "Music Catalog | Next.js Enterprise Boilerplate",
  description: "Search and browse the iTunes music catalog",
}

export default function CatalogPage() {
  return <CatalogGrid />
}
