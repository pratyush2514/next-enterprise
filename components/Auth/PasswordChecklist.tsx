"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import type { PasswordCheck } from "hooks/usePasswordStrength"

import { CheckIcon, XIcon } from "./icons"

type PasswordChecklistProps = {
  checks: PasswordCheck[]
}

const LABEL_KEYS: Record<PasswordCheck["key"], string> = {
  letter: "auth.signup.steps.password.requirements.letter",
  numberOrSpecial: "auth.signup.steps.password.requirements.numberOrSpecial",
  minLength: "auth.signup.steps.password.requirements.minLength",
}

export function PasswordChecklist({ checks }: PasswordChecklistProps) {
  const t = useTranslations()
  const prefersReducedMotion = useReducedMotion()

  return (
    <ul className="mt-3 space-y-2">
      {checks.map((check) => (
        <li key={check.key} className="flex items-center gap-2 text-sm">
          <AnimatePresence mode="wait" initial={false}>
            {check.passed ? (
              <motion.span
                key="check"
                className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white"
                initial={prefersReducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
              >
                <CheckIcon />
              </motion.span>
            ) : (
              <motion.span
                key="x"
                className="flex size-5 items-center justify-center rounded-full bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                initial={prefersReducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
              >
                <XIcon />
              </motion.span>
            )}
          </AnimatePresence>
          <span
            className={check.passed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}
          >
            {t(LABEL_KEYS[check.key])}
          </span>
        </li>
      ))}
    </ul>
  )
}
