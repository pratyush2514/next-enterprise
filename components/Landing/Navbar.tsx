"use client"

import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { trackNavCtaClicked } from "lib/analytics"
import { cn } from "lib/utils"

import { MusicalConfetti } from "./MusicalConfetti"

const SCROLL_THRESHOLD = 50

type NavbarProps = {
  /** "transparent" starts clear over dark hero, "solid" starts with background immediately */
  variant?: "transparent" | "solid"
}

export function Navbar({ variant = "transparent" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Solid variant always shows the background
  const showBg = variant === "solid" || scrolled
  const showLightText = variant === "transparent" && !scrolled

  return (
    <motion.nav
      className={cn(
        "fixed top-0 right-0 left-0 z-40 transition-all duration-500",
        showBg ? "bg-white/90 shadow-sm backdrop-blur-xl dark:bg-gray-950/90" : "bg-transparent"
      )}
      initial={prefersReducedMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo with musical confetti */}
        <Link href="/" className="flex items-center">
          <MusicalConfetti>
            <span
              className={cn(
                "text-xl font-bold tracking-tight transition-colors duration-500",
                showLightText ? "text-white" : "text-gray-900 dark:text-white"
              )}
            >
              melodix
            </span>
          </MusicalConfetti>
        </Link>

        {/* Right controls — mr-11 leaves room for the fixed ThemeToggle (z-50) */}
        <div className="mr-11 flex items-center gap-3">
          <a
            href="#"
            className={cn(
              "hidden text-sm font-medium transition-colors duration-500 sm:block",
              showLightText
                ? "text-white/80 hover:text-white"
                : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            )}
          >
            Log In
          </a>

          {/* Globe icon */}
          <button
            type="button"
            className={cn(
              "hidden size-9 items-center justify-center rounded-full transition-colors duration-500 sm:flex",
              showLightText
                ? "text-white/70 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
            aria-label="Select language"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
          </button>

          {/* CTA Button */}
          <Link
            href="/catalog"
            onClick={() => trackNavCtaClicked("/catalog")}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              showLightText
                ? "bg-[#2DD282] text-gray-900 hover:bg-[#25C075]"
                : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
            )}
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
