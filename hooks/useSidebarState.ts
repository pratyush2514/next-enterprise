"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "melodix-sidebar-collapsed"

export function useSidebarState() {
  // Default to expanded (false = not collapsed) for SSR hydration safety
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Read localStorage in useEffect (client-only) to avoid hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "true") {
        setIsCollapsed(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // localStorage unavailable
      }
      return next
    })
  }, [])

  return { isCollapsed, toggle }
}
