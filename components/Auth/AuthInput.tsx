"use client"

import { forwardRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "lib/utils"

import { EyeIcon, EyeOffIcon } from "./icons"

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const prefersReducedMotion = useReducedMotion()
    const isPassword = type === "password"
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-300",
              "focus:border-emerald-400 focus:shadow-md focus:ring-2 focus:ring-emerald-500/20 focus:outline-none",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              error && "border-red-400 focus:border-red-400 focus:ring-red-500/20",
              isPassword && "pr-12",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-sm text-red-500"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AuthInput.displayName = "AuthInput"
