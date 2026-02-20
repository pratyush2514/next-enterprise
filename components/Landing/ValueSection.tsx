"use client"

import { useRef } from "react"
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion"

import { cn } from "lib/utils"

import { ScrollReveal } from "./ScrollReveal"

/* ── Constants ────────────────────────────────────────────────────── */

const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`

const FEATURES = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: "Instant Search",
    description:
      "Type any song, artist, or album and get real-time results from the iTunes catalog. Debounced queries keep things fast without hammering the API.",
    gradient: "radial-gradient(ellipse 80% 60% at 50% 40%, #065F46 0%, #064E3B 50%, #052E23 100%)",
    glowColor: "rgba(52, 211, 153, 0.12)",
    accentColor: "rgba(110, 231, 183, 0.08)",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    title: "Hover to Preview",
    description:
      "Hover over any track to hear a 30-second preview instantly. No clicks, no popups — just hover and listen. Scrub the seekbar to jump around.",
    gradient: "radial-gradient(ellipse 80% 60% at 50% 40%, #7C3AED 0%, #581C87 50%, #3B0764 100%)",
    glowColor: "rgba(167, 139, 250, 0.12)",
    accentColor: "rgba(196, 181, 253, 0.08)",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    title: "Browse by Genre",
    description:
      "Every result includes genre tags, album info, and pricing. Quickly scan Pop, Rock, Hip-Hop, Jazz, and everything in between — all in one grid.",
    gradient: "radial-gradient(ellipse 80% 60% at 50% 40%, #B45309 0%, #92400E 50%, #6B2F0A 100%)",
    glowColor: "rgba(251, 191, 36, 0.12)",
    accentColor: "rgba(252, 211, 77, 0.08)",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full"
      >
        <path d="M12 3v18" />
        <path d="M3 12h18" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    title: "Clean, Responsive Grid",
    description:
      "A polished card-based layout that adapts from mobile to desktop. Album art, pricing, and metadata at a glance — no clutter, no noise.",
    gradient: "radial-gradient(ellipse 80% 60% at 50% 40%, #155E75 0%, #164E63 50%, #0E3740 100%)",
    glowColor: "rgba(34, 211, 238, 0.12)",
    accentColor: "rgba(103, 232, 249, 0.08)",
  },
]

type Feature = (typeof FEATURES)[number]

/* ── Per-card decorative accents ──────────────────────────────────── */

function CardDecoration({ index }: { index: number }) {
  if (index === 0) {
    return (
      <>
        <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute -top-10 -right-10 size-60 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-72 rounded-full border border-white/[0.05]" />
      </>
    )
  }
  if (index === 1) {
    return (
      <div className="pointer-events-none absolute bottom-20 left-1/2 flex -translate-x-1/2 items-end gap-1.5 opacity-[0.15]">
        {[0.5, 0.8, 0.3, 1, 0.6, 0.9, 0.4, 0.7, 0.5, 0.85, 0.35, 0.75].map((h, i) => (
          <div
            key={i}
            className="animate-bounce-music w-1.5 origin-bottom rounded-full bg-white"
            style={{ height: `${h * 48}px`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    )
  }
  if (index === 2) {
    return (
      <>
        {[
          "top-[18%] left-[12%] size-6",
          "top-[25%] right-[18%] size-8",
          "bottom-[22%] left-[20%] size-5",
          "bottom-[30%] right-[14%] size-7",
          "top-[50%] left-[8%] size-4",
          "top-[60%] right-[10%] size-6",
        ].map((cls, i) => (
          <div key={i} className={cn("pointer-events-none absolute rounded-full bg-white/[0.06]", cls)} />
        ))}
      </>
    )
  }
  if (index === 3) {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    )
  }
  return null
}

/* ── Sticky card with layered scroll-driven animation ─────────────── */

function StickyCard({ feature, index }: { feature: Feature; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  })

  // First card renders content immediately — it's the entry point.
  // Cards 2-4 use scroll-driven staggered reveals.
  const isFirst = index === 0

  /* Content reveals — staggered timing (skipped for first card) */
  const stepOpacity = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.3, 0.5], [0, 1])
  const stepY = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.3, 0.5], [10, 0])

  const iconScale = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.35, 0.55], [0.6, 1])
  const iconRotate = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.35, 0.55], [-10, 0])
  const iconOpacity = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.35, 0.55], [0, 1])

  const lineScaleX = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.4, 0.65], [0, 1])

  const headingY = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.4, 0.65], [30, 0])
  const headingOpacity = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.4, 0.65], [0, 1])
  const blurValue = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.4, 0.65], [8, 0])
  const headingFilter = useMotionTemplate`blur(${blurValue}px)`

  const descY = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.5, 0.75], [20, 0])
  const descOpacity = useTransform(scrollYProgress, isFirst ? [0, 0.01] : [0.5, 0.75], [0, 1])

  /* Background parallax layers */
  const bgY1 = useTransform(scrollYProgress, [0, 1], [isFirst ? 20 : 60, -20])
  const bgY2 = useTransform(scrollYProgress, [0, 1], [isFirst ? 15 : 40, -40])
  const bgY3 = useTransform(scrollYProgress, [0, 1], [isFirst ? 25 : 80, -10])
  const glowScale = useTransform(scrollYProgress, [0.2, 0.8], [isFirst ? 0.95 : 0.7, 1.1])
  const sweepX = useTransform(scrollYProgress, [0.1, 0.9], [-200, 100])

  return (
    <div ref={cardRef} className="sticky top-0 overflow-hidden" style={{ zIndex: 10 + index }}>
      <div className="relative flex min-h-screen items-center justify-center">
        {/* Gradient background — always fully opaque, no ghosting */}
        <div className="absolute inset-0" style={{ background: feature.gradient }} />

        {/* Noise texture for grain depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: NOISE_TEXTURE }}
        />

        {/* Central radial glow */}
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            width: "45vw",
            height: "45vw",
            maxWidth: 700,
            maxHeight: 700,
            background: feature.glowColor,
            scale: glowScale,
          }}
        />

        {/* Floating parallax shapes */}
        <motion.div
          className="pointer-events-none absolute rounded-full blur-2xl"
          style={{ width: 200, height: 200, top: "12%", left: "8%", background: feature.accentColor, y: bgY1 }}
        />
        <motion.div
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{ width: 280, height: 280, bottom: "8%", right: "5%", background: feature.accentColor, y: bgY2 }}
        />
        <motion.div
          className="pointer-events-none absolute rounded-full blur-2xl"
          style={{ width: 150, height: 150, top: "55%", left: "72%", background: feature.accentColor, y: bgY3 }}
        />

        {/* Diagonal light sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)",
            x: sweepX,
          }}
        />

        {/* Card-specific decoration */}
        <CardDecoration index={index} />

        {/* Content — staggered scroll-driven reveal */}
        <div className="relative z-10 flex max-w-3xl flex-col items-center px-6 text-center">
          <motion.p
            className="mb-6 text-xs font-semibold tracking-[0.25em] text-white/50 uppercase sm:text-sm"
            style={{ opacity: stepOpacity, y: stepY }}
          >
            Step {index + 1}
          </motion.p>

          <motion.div
            className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur-sm sm:size-20"
            style={{ scale: iconScale, rotate: iconRotate, opacity: iconOpacity }}
          >
            <div className="size-8 sm:size-10">{feature.icon}</div>
          </motion.div>

          <motion.div
            className="mb-6 h-px w-12 bg-white/20"
            style={{ scaleX: lineScaleX, transformOrigin: "center" }}
          />

          <motion.h3
            className="mb-5 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            style={{ y: headingY, opacity: headingOpacity, filter: headingFilter }}
          >
            {feature.title}
          </motion.h3>

          <motion.p
            className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl"
            style={{ y: descY, opacity: descOpacity }}
          >
            {feature.description}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

/* ── Main section ─────────────────────────────────────────────────── */

export function ValueSection() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <section className="bg-white py-20 lg:py-28 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                How it works
              </p>
              <h2 className="mt-3 text-3xl leading-tight font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
                Search. Preview. Discover.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
                Melodix connects you to millions of songs through the iTunes Search API. Find tracks instantly, preview
                them on hover, and explore by genre — all from one interface.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "w-full rounded-2xl border border-gray-200/80 p-8",
                  "bg-white shadow-xl shadow-gray-200/50",
                  "dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-950/50"
                )}
              >
                <div
                  className={cn(
                    "mb-5 flex size-12 items-center justify-center rounded-xl",
                    "bg-emerald-100 text-emerald-600",
                    "dark:bg-emerald-900/40 dark:text-emerald-400"
                  )}
                >
                  <div className="size-6">{feature.icon}</div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Section heading */}
      <div className="flex flex-col items-center justify-center bg-white px-6 py-24 sm:py-32 dark:bg-gray-950">
        <p className="text-sm font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
          How it works
        </p>
        <h2 className="mt-3 max-w-2xl text-center text-3xl leading-tight font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Search. Preview. Discover.
        </h2>
        <p className="mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
          Melodix connects you to millions of songs through the iTunes Search API. Find tracks instantly, preview them
          on hover, and explore by genre — all from one interface.
        </p>
      </div>

      {/* Sticky stacking cards */}
      {FEATURES.map((feature, i) => (
        <StickyCard key={feature.title} feature={feature} index={i} />
      ))}
    </section>
  )
}
