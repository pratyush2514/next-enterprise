"use client"

import { cn } from "lib/utils"

import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal"

const BRAND_LOGOS = [
  { name: "Kidarruk", style: "font-black uppercase tracking-widest text-lg" },
  { name: "point chaud", style: "font-semibold text-base tracking-wide", prefix: true },
  { name: "ROTTERDAM AHOY", style: "font-black uppercase text-sm tracking-[0.15em]" },
  { name: "Panos", style: "font-bold italic text-xl" },
  { name: "DECATHLON", style: "font-black uppercase text-base tracking-[0.2em]" },
  { name: "BEAU", style: "font-bold uppercase text-xl tracking-[0.15em] border border-current px-2 py-0.5" },
  { name: "WOODY", style: "font-black uppercase text-lg tracking-[0.1em]" },
]

export function SocialProof() {
  return (
    <section className="bg-white py-20 lg:py-28 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Heading */}
        <ScrollReveal>
          <h2 className="mx-auto mb-16 max-w-2xl text-center text-2xl leading-snug font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
            Join over 10,000 bars, restaurants, stores, and other businesses!
          </h2>
        </ScrollReveal>

        {/* Brand logos */}
        <StaggerContainer
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14 lg:gap-x-16"
          staggerDelay={0.06}
        >
          {BRAND_LOGOS.map((brand) => (
            <StaggerItem key={brand.name}>
              <div
                className={cn(
                  "text-gray-400 transition-colors duration-300 select-none hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-300",
                  brand.style
                )}
                aria-label={brand.name}
              >
                {brand.prefix && (
                  <span className="mr-1 inline-flex size-4 items-center justify-center rounded-sm bg-current opacity-40">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="18" r="3" />
                    </svg>
                  </span>
                )}
                {brand.name}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
