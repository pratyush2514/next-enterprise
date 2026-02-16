import posthog from "posthog-js"

let initialized = false

export function initPostHog(): typeof posthog | null {
  if (typeof window === "undefined") return null

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"

  if (!enabled || !key) return null
  if (initialized) return posthog

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    autocapture: false,
    disable_session_recording: true,
    respect_dnt: true,
    capture_pageview: false,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug()
      }
    },
  })

  initialized = true
  return posthog
}

export function getPostHog(): typeof posthog | null {
  if (!initialized || typeof window === "undefined") return null
  return posthog
}
