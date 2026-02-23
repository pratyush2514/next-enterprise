"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { cn } from "lib/utils"

import { SIGNUP_STEPS, SPRING_CONFIG } from "./constants"

type StepProgressProps = {
  currentStep: number
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const t = useTranslations("auth.progress")
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {SIGNUP_STEPS.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-2 rounded-full transition-colors duration-300",
              index === currentStep
                ? "bg-emerald-500"
                : index < currentStep
                  ? "bg-emerald-300 dark:bg-emerald-700"
                  : "bg-gray-200 dark:bg-gray-700"
            )}
            animate={prefersReducedMotion ? undefined : { width: index === currentStep ? 24 : 8 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", ...SPRING_CONFIG }}
            style={{ width: prefersReducedMotion ? (index === currentStep ? 24 : 8) : undefined }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {t("step", { current: currentStep + 1, total: SIGNUP_STEPS.length })}
      </p>
    </div>
  )
}
