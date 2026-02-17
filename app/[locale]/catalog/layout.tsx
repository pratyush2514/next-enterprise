import { CatalogShell } from "components/Catalog/CatalogShell"
import { FavoritesProvider } from "hooks/useFavorites"

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <CatalogShell>{children}</CatalogShell>
    </FavoritesProvider>
  )
}
