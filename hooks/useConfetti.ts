"use client"

import { useReducedMotion } from "framer-motion"
import { useCallback, useRef, useState } from "react"

const NOTES = ["♩", "♪", "♫", "♬", "♭", "♯"]
const PARTICLE_COUNT = 10
const PARTICLE_LIFETIME_MS = 900

/** CSS custom properties defined in tailwind.css (:root / .dark) */
const CONFETTI_COLORS = [
  "var(--confetti-1)",
  "var(--confetti-2)",
  "var(--confetti-3)",
  "var(--confetti-4)",
  "var(--confetti-5)",
  "var(--confetti-6)",
]

export type Particle = {
  id: number
  note: string
  x: number
  y: number
  rotate: number
  scale: number
  color: string
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createParticle(id: number): Particle {
  return {
    id,
    note: NOTES[Math.floor(Math.random() * NOTES.length)]!,
    x: randomBetween(-28, 28),
    y: randomBetween(-28, 28),
    rotate: randomBetween(-60, 60),
    scale: randomBetween(0.6, 1.2),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
  }
}

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const idCounter = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const prefersReducedMotion = useReducedMotion()

  const trigger = useCallback(() => {
    if (prefersReducedMotion) return

    const newParticles = Array.from({ length: PARTICLE_COUNT }, () => {
      idCounter.current += 1
      return createParticle(idCounter.current)
    })
    setParticles(newParticles)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setParticles([])
    }, PARTICLE_LIFETIME_MS)
  }, [prefersReducedMotion])

  return { particles, trigger }
}
