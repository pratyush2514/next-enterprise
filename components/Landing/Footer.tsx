"use client"

import Link from "next/link"

import { trackAppStoreClicked, trackSocialLinkClicked } from "lib/analytics"
import { cn } from "lib/utils"

import { ScrollReveal } from "./ScrollReveal"

const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

const FOOTER_LINKS = [
  { label: "About", href: "#" },
  { label: "Help Center", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Main footer */}
        <ScrollReveal>
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:gap-20">
            {/* Left column */}
            <div>
              <Link href="/" className="inline-block">
                <span className="text-xl font-bold text-gray-900 dark:text-white">melodix</span>
              </Link>

              {/* Social icons */}
              <div className="mt-5 flex items-center gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => trackSocialLinkClicked(link.name.toLowerCase())}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-gray-400 transition-all duration-300",
                      "hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    )}
                    aria-label={link.name}
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Other countries
              </button>
            </div>

            {/* Right column */}
            <div className="sm:text-right">
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Melodix</h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-1.5">
                <p className="flex items-center gap-2 text-sm text-gray-500 sm:justify-end dark:text-gray-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="shrink-0 text-emerald-500"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  info@melodix.com
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-500 sm:justify-end dark:text-gray-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  0800 023 3029
                </p>
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
              aria-label="Download on the App Store"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-[8px] leading-none opacity-70">Download on the</div>
                <div className="text-xs leading-tight font-semibold">App Store</div>
              </div>
            </a>

            <a
              href="#"
              onClick={() => trackAppStoreClicked("google_play")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-white transition-opacity hover:opacity-80",
                "dark:bg-white dark:text-gray-900"
              )}
              aria-label="Get it on Google Play"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
              </svg>
              <div className="text-left">
                <div className="text-[8px] leading-none opacity-70">GET IT ON</div>
                <div className="text-xs leading-tight font-semibold">Google Play</div>
              </div>
            </a>
          </div>

          {/* Copyright + links */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>&copy; 2026 Melodix</span>
            <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">
              General terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
