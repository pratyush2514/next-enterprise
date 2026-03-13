import { setRequestLocale } from "next-intl/server"

import { SongsShell } from "components/Songs/SongsShell"

export default async function SongsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SongsShell>{children}</SongsShell>
}
