"use client"

import { motion, useReducedMotion } from "framer-motion"

import { trackCtaClicked } from "lib/analytics"
import { cn } from "lib/utils"

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  const headingWords = "It is time for the next tune...".split(" ")

  return (
    <section className={cn("relative overflow-hidden", "bg-gradient-to-b from-[#0B4D35] via-[#0A3928] to-[#061A11]")}>
      {/* Subtle radial glow — centered on heading area */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(45, 210, 130, 0.12), transparent)",
        }}
      />

      {/* Grain texture overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-24 sm:pt-36 sm:pb-28 lg:px-8 lg:pt-44 lg:pb-32">
        {/* Heading */}
        <h1 className="mx-auto max-w-3xl text-center text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {prefersReducedMotion
            ? "It is time for the next tune..."
            : headingWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="mr-[0.3em] inline-block last:mr-0"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 20,
                    delay: 0.15 + i * 0.07,
                  }}
                >
                  {word}
                </motion.span>
              ))}
        </h1>

        {/* Tagline + CTA */}
        <motion.div
          className="mx-auto mt-12 flex max-w-lg flex-col items-center gap-5 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 18,
            delay: 0.6,
          }}
        >
          <p className="text-base leading-relaxed text-white/60 sm:text-lg">
            Search millions of tracks, preview on hover, and discover your next favorite song.
          </p>

          <motion.a
            href="/catalog"
            onClick={() => trackCtaClicked("hero", "/catalog")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white",
              "bg-emerald-600 shadow-lg shadow-emerald-600/25",
              "transition-colors duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3928] focus-visible:outline-none"
            )}
            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            Explore Catalog
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
