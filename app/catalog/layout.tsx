import { CatalogShell } from "components/Catalog/CatalogShell"

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <CatalogShell>{children}</CatalogShell>
}
