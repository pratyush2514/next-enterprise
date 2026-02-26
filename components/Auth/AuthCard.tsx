"use client"

import { motion, useReducedMotion } from "framer-motion"

import { cn } from "lib/utils"

import { SPRING_CONFIG } from "./constants"

type AuthCardProps = {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(
        "w-full max-w-md rounded-2xl border border-transparent bg-white p-5 shadow-xl sm:p-8 dark:border-gray-800 dark:bg-gray-900",
        className
      )}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", ...SPRING_CONFIG }}
    >
      {children}
    </motion.div>
  )
}
