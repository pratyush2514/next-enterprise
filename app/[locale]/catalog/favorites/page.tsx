import type { Metadata } from "next"

import { FavoritesGrid } from "components/Catalog/FavoritesGrid"

export const metadata: Metadata = {
  title: "Favorites | Melodix",
  description: "Your favorite tracks — saved locally for quick access.",
}

export default function FavoritesPage() {
  return <FavoritesGrid />
}
