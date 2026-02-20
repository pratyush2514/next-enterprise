"use client"

import { motion, useReducedMotion } from "framer-motion"

import { Link } from "i18n/navigation"
import { trackNotFoundClicked } from "lib/analytics"
import { cn } from "lib/utils"

/* ------------------------------------------------------------------ */
/*  Floating musical notes — decorative background animation          */
/* ------------------------------------------------------------------ */

const NOTES = [
  { char: "\u266A", x: "12%", delay: 0, size: "text-2xl" },
  { char: "\u266B", x: "28%", delay: 0.8, size: "text-3xl" },
  { char: "\u266A", x: "45%", delay: 1.6, size: "text-xl" },
  { char: "\u266B", x: "62%", delay: 0.4, size: "text-2xl" },
  { char: "\u266A", x: "78%", delay: 1.2, size: "text-3xl" },
  { char: "\u266B", x: "88%", delay: 2.0, size: "text-xl" },
]

function FloatingNotes({ reducedMotion }: { reducedMotion: boolean | null }) {
  if (reducedMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {NOTES.map((note, i) => (
        <motion.span
          key={i}
          className={cn(note.size, "absolute bottom-0 text-emerald-500/15 dark:text-emerald-400/10")}
          style={{ left: note.x }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-100vh", opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: 8,
            delay: note.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {note.char}
        </motion.span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Vinyl record SVG — used as the "0" in 404                        */
/* ------------------------------------------------------------------ */

function VinylRecord({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="inline-block size-[0.85em] align-baseline"
      animate={reducedMotion ? {} : { rotate: 360 }}
      transition={reducedMotion ? {} : { duration: 4, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      {/* Outer disc */}
      <circle cx="60" cy="60" r="58" className="fill-gray-900 dark:fill-gray-100" />
      {/* Grooves */}
      <circle cx="60" cy="60" r="48" fill="none" className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="40" fill="none" className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="32" fill="none" className="stroke-gray-700 dark:stroke-gray-300" strokeWidth="0.5" />
      {/* Label */}
      <circle cx="60" cy="60" r="20" className="fill-emerald-600 dark:fill-emerald-500" />
      {/* Spindle hole */}
      <circle cx="60" cy="60" r="4" className="fill-gray-900 dark:fill-gray-100" />
    </motion.svg>
  )
}

/* ------------------------------------------------------------------ */
/*  404 Not Found page                                                */
/* ------------------------------------------------------------------ */

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  }

  const childVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring" as const, stiffness: 80, damping: 20 },
        },
      }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      {/* Radial glow — matches hero */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(16, 185, 129, 0.06), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Grain texture — matches hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Floating notes */}
      <FloatingNotes reducedMotion={prefersReducedMotion} />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-2xl px-6 py-24 text-center lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 — with vinyl record as the "0" */}
        <motion.p
          variants={childVariants}
          className="text-[8rem] leading-none font-bold tracking-tighter text-gray-900 sm:text-[10rem] md:text-[12rem] dark:text-white"
        >
          4<VinylRecord reducedMotion={prefersReducedMotion} />4
        </motion.p>

        {/* Heading */}
        <motion.h1
          variants={childVariants}
          className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl dark:text-white"
        >
          Track not found
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={childVariants}
          className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-500 dark:text-gray-400"
        >
          The song you&apos;re looking for seems to have skipped off the playlist. Let&apos;s get you back to the music.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={childVariants}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/"
            onClick={() => trackNotFoundClicked("home")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white",
              "bg-emerald-600 shadow-lg shadow-emerald-600/25",
              "transition-colors duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none",
              "dark:focus-visible:ring-offset-gray-950"
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clipRule="evenodd"
              />
            </svg>
            Back Home
          </Link>

          <Link
            href="/catalog"
            onClick={() => trackNotFoundClicked("catalog")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-base font-semibold",
              "border-gray-200 bg-white text-gray-700",
              "transition-colors duration-300 hover:border-gray-300 hover:bg-gray-50",
              "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none",
              "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800",
              "dark:focus-visible:ring-offset-gray-950"
            )}
          >
            Explore Catalog
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
