"use client"

import { motion, useReducedMotion } from "framer-motion"

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const springTransition = {
  type: "spring" as const,
  stiffness: 80,
  damping: 20,
}

type StepTransitionProps = {
  children: React.ReactNode
  direction: number
  stepKey: string
}

export function StepTransition({ children, direction, stepKey }: StepTransitionProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div key={stepKey}>{children}</div>
  }

  return (
    <motion.div
      key={stepKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={springTransition}
    >
      {children}
    </motion.div>
  )
}
