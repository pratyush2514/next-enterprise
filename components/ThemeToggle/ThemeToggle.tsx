"use client"

import { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { cn } from "lib/utils"

import { THEME, THEME_LABELS } from "./constants"
import { ThemeToggleIcon } from "./ThemeToggleIcon"

function useThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === THEME.DARK

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK

    // Block all CSS transitions so the switch is instant — no element-level color animations
    const blocker = document.createElement("style")
    blocker.textContent = "*, *::before, *::after { transition: none !important; }"
    document.head.appendChild(blocker)

    // Apply to DOM synchronously, then sync next-themes state
    document.documentElement.classList.toggle(THEME.DARK, newTheme === THEME.DARK)
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
      aria-label={isDark ? THEME_LABELS.SWITCH_TO_LIGHT : THEME_LABELS.SWITCH_TO_DARK}
    >
      <span className="sr-only">{THEME_LABELS.TOGGLE}</span>
      <ThemeToggleIcon isDark={isDark} />
    </button>
  )
}
