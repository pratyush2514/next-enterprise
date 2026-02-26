"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { Link } from "i18n/navigation"
import { trackCtaClicked } from "lib/analytics"
import { cn } from "lib/utils"

import { ROUTES } from "./constants"
import { CloseIcon, GlobeIcon, MenuIcon } from "./icons"
import { MusicalConfetti } from "./MusicalConfetti"

const SCROLL_THRESHOLD = 50

type NavbarProps = {
  /** "transparent" starts clear over dark hero, "solid" starts with background immediately */
  variant?: "transparent" | "solid"
}

export function Navbar({ variant = "transparent" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations("nav")

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  /* ── Derived state ──────────────────────────────── */

  const showBg = variant === "solid" || scrolled
  const showLightText = variant === "transparent" && !scrolled

  /* ── Precomputed class strings for readability ──── */

  const navBarClasses = cn(
    "fixed top-0 right-0 left-0 z-40 transition-all duration-500",
    showBg ? "bg-white/90 shadow-sm backdrop-blur-xl dark:bg-gray-950/90" : "bg-transparent"
  )

  const navLinkClasses = cn(
    "hidden text-sm font-medium transition-colors duration-500 sm:block",
    showLightText
      ? "text-white/80 hover:text-white"
      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
  )

  const logoClasses = cn(
    "text-xl font-bold tracking-tight transition-colors duration-500",
    showLightText ? "text-white" : "text-gray-900 dark:text-white"
  )

  const globeButtonClasses = cn(
    "hidden size-9 items-center justify-center rounded-full transition-colors duration-500 sm:flex",
    showLightText
      ? "text-white/70 hover:text-white"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
  )

  const ctaClasses = cn(
    "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
    "hover:scale-[1.02] active:scale-[0.98]",
    showLightText
      ? "bg-emerald-400 text-gray-900 hover:bg-emerald-300"
      : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
  )

  /* ── Render ─────────────────────────────────────── */

  return (
    <motion.nav
      className={navBarClasses}
      initial={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <MusicalConfetti>
            <span className={logoClasses}>melodix</span>
          </MusicalConfetti>
        </Link>

        {/* Right controls — mr-11 leaves room for the fixed ThemeToggle (z-50) */}
        <div className="mr-11 flex items-center gap-3">
          <Link
            href={ROUTES.LOGIN}
            onClick={() => trackCtaClicked("cta_banner", ROUTES.LOGIN)}
            className={navLinkClasses}
          >
            {t("logIn")}
          </Link>

          <button type="button" className={globeButtonClasses} aria-label={t("selectLanguage")}>
            <GlobeIcon />
          </button>

          <Link href={ROUTES.SONG} className={ctaClasses}>
            {t("cta.control")}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg transition-colors sm:hidden",
              showLightText
                ? "text-white/70 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
            aria-label={t("openMenu")}
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 flex h-full w-3/4 max-w-sm flex-col bg-white p-6 shadow-xl dark:bg-gray-950"
            >
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="mb-8 ml-auto flex size-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-white/60"
                aria-label={t("closeMenu")}
              >
                <CloseIcon className="size-5" />
              </button>
              <nav className="flex flex-col gap-4">
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  {t("logIn")}
                </Link>
                <Link
                  href={ROUTES.SONG}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-emerald-500 px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  {t("cta.control")}
                </Link>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
