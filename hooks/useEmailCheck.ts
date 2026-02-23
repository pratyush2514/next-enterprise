"use client"

import { useEffect, useRef, useState } from "react"

import { checkEmailExists } from "lib/services/auth-api"

import { useDebounce } from "./useDebounce"

export function useEmailCheck(email: string) {
  const [isChecking, setIsChecking] = useState(false)
  const [exists, setExists] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController>()

  const debouncedEmail = useDebounce(email, 500)

  useEffect(() => {
    // Reset if no valid email
    if (!debouncedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
      setExists(null)
      setError(null)
      setIsChecking(false)
      return
    }

    // Cancel previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsChecking(true)
    setError(null)

    checkEmailExists(debouncedEmail, controller.signal)
      .then((result) => {
        setExists(result.exists)
        setIsChecking(false)
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return
        setError("emailCheckFailed")
        setIsChecking(false)
      })

    return () => {
      controller.abort()
    }
  }, [debouncedEmail])

  return { isChecking, exists, error }
}
