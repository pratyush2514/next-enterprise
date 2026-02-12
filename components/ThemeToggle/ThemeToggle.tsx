"use client"

/**
 * Theme toggle adapted from Skipper UI (Skiper 26)
 * Configuration: variant="circle-blur", start="top-right", blur=true
 *
 * Uses the View Transitions API for smooth theme transitions.
 * Falls back to instant switch when API is unavailable.
 *
 * Original concept by rudrodip (https://github.com/rudrodip/theme-toggle-effect)
 * Skipper UI by @gurvinder-singh02 (https://gxuri.in)
 */

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"

import { cn } from "lib/utils"

// Animation configuration for circle-blur variant, top-right start, blur enabled
function createCircleBlurAnimation(): string {
  const svg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="40" cy="0" r="18" fill="white" filter="url(%23blur)"/></svg>`

  return `
    ::view-transition-group(root) {
      animation-timing-function: var(--expo-out);
    }

    ::view-transition-new(root) {
      mask: url('${svg}') top right / 0 no-repeat;
      mask-origin: content-box;
      animation: skipper-scale 1s;
      transform-origin: top right;
    }

    ::view-transition-old(root),
    .dark::view-transition-old(root) {
      animation: skipper-scale 1s;
      transform-origin: top right;
      z-index: -1;
    }

    @keyframes skipper-scale {
      to {
        mask-size: 350vmax;
      }
    }
  `
}

function useThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsDark(resolvedTheme === "dark")
  }, [resolvedTheme])

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return

    const styleId = "theme-transition-styles"
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = css
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark)

    const css = createCircleBlurAnimation()
    updateStyles(css)

    if (typeof window === "undefined") return

    const switchTheme = () => {
      setTheme(theme === "light" ? "dark" : "light")
    }

    // Fall back to instant switch if View Transitions API is unavailable
    // or user prefers reduced motion
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      switchTheme()
      return
    }

    document.startViewTransition(switchTheme)
  }, [theme, setTheme, updateStyles, isDark])

  return { isDark, mounted, toggleTheme }
}

export function ThemeToggle() {
  const { isDark, mounted, toggleTheme } = useThemeToggle()

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) return null

  return (
    <button
      type="button"
      className={cn(
        "fixed top-4 right-4 z-50 size-8 cursor-pointer rounded-full bg-black p-0",
        "transition-all duration-300 active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      )}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="sr-only">Toggle theme</span>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ rotate: isDark ? -180 : 0 }} transition={{ ease: "easeInOut", duration: 0.5 }}>
          <path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill="white" />
          <path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill="black" />
        </motion.g>
        <motion.path
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="white"
        />
      </svg>
    </button>
  )
}
