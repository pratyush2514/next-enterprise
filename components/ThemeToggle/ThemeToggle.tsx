"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"

import { trackThemeSwitch } from "lib/analytics"
import { cn } from "lib/utils"

function useThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = useCallback(() => {
    const from = resolvedTheme ?? "unknown"
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"

    trackThemeSwitch(from, newTheme)

    // Block all CSS transitions so the switch is instant — no element-level color animations
    const blocker = document.createElement("style")
    blocker.textContent = "*, *::before, *::after { transition: none !important; }"
    document.head.appendChild(blocker)

    // Apply to DOM synchronously, then sync next-themes state
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    document.documentElement.style.colorScheme = newTheme
    setTheme(newTheme)

    // Remove blocker after React re-render + useEffect have settled
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        blocker.remove()
      })
    })
  }, [resolvedTheme, setTheme])

  return { isDark, mounted, toggleTheme }
}

export function ThemeToggle() {
  const { isDark, mounted, toggleTheme } = useThemeToggle()

  if (!mounted) return null

  return (
    <button
      type="button"
      className={cn(
        "fixed top-4 right-4 z-50 size-8 cursor-pointer rounded-full bg-black p-0 dark:bg-white",
        "transition-all duration-300 active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      )}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="sr-only">Toggle theme</span>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ rotate: isDark ? -180 : 0 }} transition={{ ease: "easeInOut", duration: 0.5 }}>
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            fill={isDark ? "black" : "white"}
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            fill={isDark ? "white" : "black"}
          />
        </motion.g>
        <motion.path
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill={isDark ? "black" : "white"}
        />
      </svg>
    </button>
  )
}
