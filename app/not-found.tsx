import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

import NotFoundContent from "./NotFoundContent"

export default async function NotFound() {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NotFoundContent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
