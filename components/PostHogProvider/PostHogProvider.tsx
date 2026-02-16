"use client"

import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useState } from "react"

import { initPostHog } from "lib/posthog"

type PostHogClient = ReturnType<typeof initPostHog>

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<PostHogClient>(null)

  useEffect(() => {
    const ph = initPostHog()
    if (ph) setClient(ph)
  }, [])

  if (!client) return <>{children}</>
  return <PHProvider client={client}>{children}</PHProvider>
}
