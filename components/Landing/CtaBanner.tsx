"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Link } from "i18n/navigation"
import { cn } from "lib/utils"

import { ArrowRightIcon } from "./icons"
import { ScrollReveal } from "./ScrollReveal"

export function CtaBanner() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="bg-white px-6 py-16 lg:px-8 lg:py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-20",
              "bg-gradient-to-br from-emerald-50 via-emerald-100/80 to-teal-100",
              "dark:from-emerald-950/60 dark:via-emerald-900/40 dark:to-teal-950/60"
            )}
            whileHover={prefersReducedMotion ? {} : { scale: 1.003 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Subtle decorative glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background: "radial-gradient(ellipse 50% 60% at 50% 40%, rgba(255, 255, 255, 0.3), transparent)",
              }}
            />

            <div className="relative">
              <h2 className="mx-auto max-w-xl text-3xl leading-tight font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
                Ready to Find Your Next Favorite Song?
              </h2>

              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-gray-700 dark:text-gray-300">
                Search millions of tracks, preview them instantly, and discover music across every genre — all in one
                place.
              </p>

              <div className="mt-8">
                <Link
                  href="/catalog"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white",
                    "bg-emerald-600 shadow-lg shadow-emerald-600/25",
                    "transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30",
                    "hover:scale-[1.03] active:scale-[0.98]",
                    "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
                    "dark:bg-emerald-500 dark:shadow-emerald-500/20 dark:hover:bg-emerald-400"
                  )}
                >
                  Explore Catalog
                  <ArrowRightIcon className="size-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}
