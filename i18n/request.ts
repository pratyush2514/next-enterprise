import { getRequestConfig } from "next-intl/server"

import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale
  }

  const [common, landing, auth, songs] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/landing.json`),
    import(`../messages/${locale}/auth.json`),
    import(`../messages/${locale}/songs.json`),
  ])

  return {
    locale,
    messages: {
      ...common.default,
      ...landing.default,
      ...auth.default,
      ...songs.default,
    },
  }
})
