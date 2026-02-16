"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

interface AudioPreviewState {
  activeTrackId: number | null
  isPlaying: boolean
  currentTime: number
  duration: number
}

interface AudioPreviewContextValue extends AudioPreviewState {
  play: (trackId: number, previewUrl: string) => void
  pause: () => void
  toggle: (trackId: number, previewUrl: string) => void
  seek: (time: number) => void
}

const AudioPreviewContext = createContext<AudioPreviewContextValue | null>(null)

export function AudioPreviewProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeUrlRef = useRef<string>("")
  const [state, setState] = useState<AudioPreviewState>({
    activeTrackId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  })

  // Lazy-init audio element (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return

    const audio = new Audio()
    audio.preload = "none"
    audioRef.current = audio

    const onTimeUpdate = () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }))
    }
    const onLoadedMetadata = () => {
      setState((s) => ({ ...s, duration: audio.duration }))
    }
    const onEnded = () => {
      setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }))
    }
    const onError = () => {
      setState((s) => ({ ...s, isPlaying: false }))
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, [])

  const play = useCallback((trackId: number, previewUrl: string) => {
    const audio = audioRef.current
    if (!audio) return

    // Different track — load new source
    if (activeUrlRef.current !== previewUrl) {
      audio.pause()
      audio.src = previewUrl
      activeUrlRef.current = previewUrl
      audio.load()
    }

    audio.play().catch(() => {
      // Browser blocked autoplay or load failed
      setState((s) => ({ ...s, isPlaying: false }))
    })

    setState((s) => ({
      ...s,
      activeTrackId: trackId,
      isPlaying: true,
      // Reset time only if new track
      ...(s.activeTrackId !== trackId ? { currentTime: 0, duration: 0 } : {}),
    }))
  }, [])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  const toggle = useCallback(
    (trackId: number, previewUrl: string) => {
      if (state.activeTrackId === trackId && state.isPlaying) {
        pause()
      } else {
        play(trackId, previewUrl)
      }
    },
    [state.activeTrackId, state.isPlaying, play, pause]
  )

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setState((s) => ({ ...s, currentTime: time }))
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      play,
      pause,
      toggle,
      seek,
    }),
    [state, play, pause, toggle, seek]
  )

  return <AudioPreviewContext.Provider value={value}>{children}</AudioPreviewContext.Provider>
}

export function useAudioPreview() {
  const context = useContext(AudioPreviewContext)
  if (!context) {
    throw new Error("useAudioPreview must be used within an AudioPreviewProvider")
  }
  return context
}
