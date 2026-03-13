import { setRequestLocale } from "next-intl/server"

import { Link } from "i18n/navigation"

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Link
        href="/"
        className="mb-8 text-3xl font-bold tracking-tight text-gray-900 transition-colors hover:text-emerald-500 dark:text-white dark:hover:text-emerald-400"
      >
        melodix
      </Link>
      {children}
    </div>
  )
}
