import { useCallback, useEffect, useRef, useState } from "react"

const DEFAULT_DELAY = 250

export function useHoverIntent(delay = DEFAULT_DELAY) {
  const [isHovering, setIsHovering] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const onPointerEnter = useCallback(
    (e: React.PointerEvent) => {
      // Ignore touch — no hover on mobile
      if (e.pointerType === "touch") return
      clearHoverTimeout()
      timeoutRef.current = setTimeout(() => {
        setIsHovering(true)
      }, delay)
    },
    [delay, clearHoverTimeout]
  )

  const onPointerLeave = useCallback(() => {
    clearHoverTimeout()
    setIsHovering(false)
  }, [clearHoverTimeout])

  const onFocus = useCallback(() => {
    clearHoverTimeout()
    setIsHovering(true)
  }, [clearHoverTimeout])

  const onBlur = useCallback(() => {
    clearHoverTimeout()
    setIsHovering(false)
  }, [clearHoverTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHoverTimeout()
    }
  }, [clearHoverTimeout])

  const containerProps = {
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
  }

  return { containerProps, isHovering }
}
