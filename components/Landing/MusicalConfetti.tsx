"use client"

import { AnimatePresence, motion } from "framer-motion"

import { useConfetti } from "hooks/useConfetti"
import { cn } from "lib/utils"

export function MusicalConfetti({ children, className }: { children: React.ReactNode; className?: string }) {
  const { particles, trigger } = useConfetti()

  return (
    <span className={cn("relative inline-flex", className)} onMouseEnter={trigger}>
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
