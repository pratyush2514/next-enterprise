import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"

import { PostHogProvider } from "components/PostHogProvider/PostHogProvider"
import { ThemeProvider } from "components/ThemeProvider/ThemeProvider"
import { routing } from "i18n/routing"
import { AuthProvider } from "lib/contexts/auth-context"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-white">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <PostHogProvider>
              <AuthProvider>{children}</AuthProvider>
            </PostHogProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
