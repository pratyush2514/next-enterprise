"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { Link } from "i18n/navigation"
import { trackCtaClicked } from "lib/analytics"
import { cn } from "lib/utils"

import { ArrowRightIcon } from "./icons"

export function HeroSection() {
  const t = useTranslations("hero")
  const prefersReducedMotion = useReducedMotion()

  const headingWords = t("heading").split(" ")

  return (
    <section className={cn("relative overflow-hidden", "from-brand-700 via-brand-800 to-brand-900 bg-gradient-to-b")}>
      {/* Subtle radial glow — centered on heading area */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 35%, color-mix(in srgb, var(--color-emerald-400) 12%, transparent), transparent)",
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
            ? t("heading")
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
          <p className="text-base leading-relaxed text-white/60 sm:text-lg">{t("tagline")}</p>

          <Link
            href="/catalog"
            onClick={() => trackCtaClicked("hero", "/catalog")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white",
              "bg-emerald-600 shadow-lg shadow-emerald-600/25",
              "transition-colors duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30",
              "focus-visible:ring-offset-brand-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            )}
          >
            {t("cta")}
            <ArrowRightIcon className="size-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
