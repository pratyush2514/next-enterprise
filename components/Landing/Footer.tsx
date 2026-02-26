"use client"

import { useTranslations } from "next-intl"

import { Link } from "i18n/navigation"
import { trackAppStoreClicked, trackSocialLinkClicked } from "lib/analytics"
import { cn } from "lib/utils"

import {
  AppleIcon,
  FacebookIcon,
  GlobeSmallIcon,
  GooglePlayIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  YouTubeIcon,
} from "./icons"
import { ScrollReveal } from "./ScrollReveal"

const SOCIAL_LINKS = [
  { key: "linkedin", icon: <LinkedInIcon /> },
  { key: "facebook", icon: <FacebookIcon /> },
  { key: "instagram", icon: <InstagramIcon /> },
  { key: "youtube", icon: <YouTubeIcon /> },
]

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="border-t border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Main footer */}
        <ScrollReveal>
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:gap-20">
            {/* Left column */}
            <div>
              <Link href="/" className="inline-block">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{t("brandName")}</span>
              </Link>

              {/* Social icons */}
              <div className="mt-5 flex items-center gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.key}
                    href="#"
                    onClick={() => trackSocialLinkClicked(link.key)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-gray-400 transition-all duration-300",
                      "hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    )}
                    aria-label={link.key}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>

              {/* Other countries */}
              <button
                type="button"
                className={cn(
                  "mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium",
                  "text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900",
                  "dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
                )}
              >
                <GlobeSmallIcon />
                {t("otherCountries")}
              </button>
            </div>

            {/* Right column */}
            <div className="sm:text-right">
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">{t("heading")}</h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("about")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("helpCenter")}
                  </a>
                </li>
              </ul>

              <div className="mt-6 space-y-1.5">
                <a
                  href="mailto:info@melodix.com"
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 sm:justify-end dark:text-gray-400 dark:hover:text-white"
                >
                  <MailIcon className="shrink-0" />
                  {t("email")}
                </a>
                <a
                  href="tel:08000233029"
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 sm:justify-end dark:text-gray-400 dark:hover:text-white"
                >
                  <PhoneIcon className="shrink-0" />
                  {t("phone")}
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-6 sm:flex-row dark:border-gray-800">
          {/* App store badges */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={() => trackAppStoreClicked("app_store")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-white transition-opacity hover:opacity-80",
                "dark:bg-white dark:text-gray-900"
              )}
              aria-label={t("appStore.appStoreLabel")}
            >
              <AppleIcon />
              <div className="text-left">
                <div className="text-[8px] leading-none opacity-70">{t("appStore.downloadOn")}</div>
                <div className="text-xs leading-tight font-semibold">{t("appStore.appStore")}</div>
              </div>
            </a>

            <a
              href="#"
              onClick={() => trackAppStoreClicked("google_play")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-white transition-opacity hover:opacity-80",
                "dark:bg-white dark:text-gray-900"
              )}
              aria-label={t("appStore.googlePlayLabel")}
            >
              <GooglePlayIcon />
              <div className="text-left">
                <div className="text-[8px] leading-none opacity-70">{t("appStore.getItOn")}</div>
                <div className="text-xs leading-tight font-semibold">{t("appStore.googlePlay")}</div>
              </div>
            </a>
          </div>

          {/* Copyright + links */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>{t("copyright")}</span>
            <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
              {t("privacy")}
            </a>
            <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
              {t("generalTerms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
