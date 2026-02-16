"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useRef, useState } from "react"

const NOTES = ["♩", "♪", "♫", "♬", "♭", "♯"]
const PARTICLE_COUNT = 10
const PARTICLE_LIFETIME_MS = 900

type Particle = {
  id: number
  note: string
  x: number
  y: number
  rotate: number
  scale: number
  color: string
}

const COLORS_LIGHT = [
  "#2DD282", // emerald accent
  "#FF6B88", // pink from volume bars
  "#818CF8", // violet
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#EC4899", // pink
]

const COLORS_DARK = [
  "#34D399", // brighter emerald
  "#FB7185", // rose
  "#A78BFA", // purple
  "#FBBF24", // brighter amber
  "#22D3EE", // brighter cyan
  "#F472B6", // pink
]

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createParticle(id: number, isDark: boolean): Particle {
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT
  return {
    id,
    note: NOTES[Math.floor(Math.random() * NOTES.length)]!,
    x: randomBetween(-28, 28),
    y: randomBetween(-28, 28),
    rotate: randomBetween(-60, 60),
    scale: randomBetween(0.6, 1.2),
    color: colors[Math.floor(Math.random() * colors.length)]!,
  }
}

export function MusicalConfetti({ children, className }: { children: React.ReactNode; className?: string }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const idCounter = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const prefersReducedMotion = useReducedMotion()

  const handleHoverStart = useCallback(() => {
    if (prefersReducedMotion) return

    // Detect dark mode from the DOM
    const isDark = document.documentElement.classList.contains("dark")

    const newParticles = Array.from({ length: PARTICLE_COUNT }, () => {
      idCounter.current += 1
      return createParticle(idCounter.current, isDark)
    })
    setParticles(newParticles)

    // Clear particles after animation lifetime
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setParticles([])
    }, PARTICLE_LIFETIME_MS)
  }, [prefersReducedMotion])

  return (
    <span className={`relative inline-flex ${className ?? ""}`} onMouseEnter={handleHoverStart}>
      {children}

      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute top-1/2 left-1/2 text-sm leading-none select-none"
            style={{ color: p.color }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0.2,
              rotate: 0,
            }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: 0,
              scale: p.scale,
              rotate: p.rotate,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden="true"
          >
            {p.note}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}
