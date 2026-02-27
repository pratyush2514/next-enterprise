"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

/* ── Types ──────────────────────────────────────────────────────────── */

export interface QueueTrack {
  trackId: number
  previewUrl: string
  trackName: string
  artistName: string
  artworkUrl: string
}

interface AudioPreviewState {
  activeTrackId: number | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isShuffleOn: boolean
  isRepeatOn: boolean
  queue: QueueTrack[]
  queueIndex: number
}

interface AudioPreviewContextValue extends AudioPreviewState {
  play: (trackId: number, previewUrl: string) => void
  pause: () => void
  toggle: (trackId: number, previewUrl: string) => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  playNext: () => void
  playPrev: () => void
  replaceQueue: (tracks: QueueTrack[], startIndex: number) => void
}

/* ── Constants ──────────────────────────────────────────────────────── */

const VOLUME_STORAGE_KEY = "melodix-volume"
const PLAYBACK_SESSION_KEY = "melodix-playback-session"
const DEFAULT_VOLUME = 0.7
const RESTART_THRESHOLD_SECONDS = 3
const SESSION_SAVE_INTERVAL_MS = 3000

interface PersistedSession {
  queue: QueueTrack[]
  queueIndex: number
  currentTime: number
  isShuffleOn: boolean
  isRepeatOn: boolean
}

/* ── Provider ───────────────────────────────────────────────────────── */

const AudioPreviewContext = createContext<AudioPreviewContextValue | null>(null)

export function AudioPreviewProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeUrlRef = useRef<string>("")

  const [state, setState] = useState<AudioPreviewState>({
    activeTrackId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: DEFAULT_VOLUME,
    isMuted: false,
    isShuffleOn: false,
    isRepeatOn: false,
    queue: [],
    queueIndex: -1,
  })

  // Refs for accessing latest state in callbacks without re-creating them
  const stateRef = useRef(state)
  stateRef.current = state

  /* ── Audio element init ──────────────────────────────────────────── */

  useEffect(() => {
    if (typeof window === "undefined") return

    const audio = new Audio()
    audio.preload = "none"
    audioRef.current = audio

    // Restore persisted volume
    try {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY)
      if (stored !== null) {
        const vol = parseFloat(stored)
        if (!isNaN(vol) && vol >= 0 && vol <= 1) {
          audio.volume = vol
          setState((s) => ({ ...s, volume: vol }))
        }
      } else {
        audio.volume = DEFAULT_VOLUME
      }
    } catch {
      audio.volume = DEFAULT_VOLUME
    }

    // Restore persisted playback session (paused at saved position)
    try {
      const raw = localStorage.getItem(PLAYBACK_SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw) as PersistedSession
        if (session.queue?.length > 0 && session.queueIndex >= 0) {
          const track = session.queue[session.queueIndex]
          if (track?.previewUrl) {
            setState((s) => ({
              ...s,
              queue: session.queue,
              queueIndex: session.queueIndex,
              activeTrackId: track.trackId,
              currentTime: session.currentTime ?? 0,
              isShuffleOn: session.isShuffleOn ?? false,
              isRepeatOn: session.isRepeatOn ?? false,
              isPlaying: false,
            }))

            audio.src = track.previewUrl
            activeUrlRef.current = track.previewUrl
            audio.preload = "metadata"
            audio.load()

            // Seek to saved position once metadata is available
            const savedTime = session.currentTime ?? 0
            if (savedTime > 0) {
              const onCanSeek = () => {
                audio.currentTime = savedTime
                audio.removeEventListener("loadedmetadata", onCanSeek)
              }
              audio.addEventListener("loadedmetadata", onCanSeek)
            }
          }
        }
      }
    } catch {
      // Corrupt data — ignore
    }

    const onTimeUpdate = () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }))
    }
    const onLoadedMetadata = () => {
      setState((s) => ({ ...s, duration: audio.duration }))
    }
    const onEnded = () => {
      const { isRepeatOn, queue, queueIndex, isShuffleOn } = stateRef.current

      if (isRepeatOn) {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }

      // Try to play next in queue
      const hasNext = isShuffleOn ? queue.length > 1 : queueIndex < queue.length - 1
      if (hasNext) {
        // Use a microtask to call playNext logic without stale closure
        playNext()
      } else {
        setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }))
      }
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

  /* ── Persist playback session ────────────────────────────────────── */

  useEffect(() => {
    // Periodically snapshot the session to localStorage
    const interval = setInterval(() => {
      const s = stateRef.current
      if (s.queue.length === 0) return
      try {
        const session: PersistedSession = {
          queue: s.queue,
          queueIndex: s.queueIndex,
          currentTime: s.currentTime,
          isShuffleOn: s.isShuffleOn,
          isRepeatOn: s.isRepeatOn,
        }
        localStorage.setItem(PLAYBACK_SESSION_KEY, JSON.stringify(session))
      } catch {
        // localStorage full or unavailable
      }
    }, SESSION_SAVE_INTERVAL_MS)

    // Also save on page close
    const handleBeforeUnload = () => {
      const s = stateRef.current
      if (s.queue.length === 0) return
      try {
        const session: PersistedSession = {
          queue: s.queue,
          queueIndex: s.queueIndex,
          currentTime: s.currentTime,
          isShuffleOn: s.isShuffleOn,
          isRepeatOn: s.isRepeatOn,
        }
        localStorage.setItem(PLAYBACK_SESSION_KEY, JSON.stringify(session))
      } catch {
        // Ignore
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  /* ── Core playback ───────────────────────────────────────────────── */

  const playTrackByIndex = useCallback((index: number) => {
    const { queue } = stateRef.current
    const track = queue[index]
    if (!track) return

    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.src = track.previewUrl
    activeUrlRef.current = track.previewUrl
    audio.load()

    audio.play().catch(() => {
      setState((s) => ({ ...s, isPlaying: false }))
    })

    setState((s) => ({
      ...s,
      activeTrackId: track.trackId,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      queueIndex: index,
    }))
  }, [])

  const play = useCallback((trackId: number, previewUrl: string) => {
    const audio = audioRef.current
    if (!audio) return

    // Different track — load new source (skip when previewUrl is empty, i.e. resume)
    if (previewUrl && activeUrlRef.current !== previewUrl) {
      audio.pause()
      audio.src = previewUrl
      activeUrlRef.current = previewUrl
      audio.load()
    }

    audio.play().catch(() => {
      setState((s) => ({ ...s, isPlaying: false }))
    })

    setState((s) => ({
      ...s,
      activeTrackId: trackId,
      isPlaying: true,
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
      const { activeTrackId, isPlaying } = stateRef.current
      if (activeTrackId === trackId && isPlaying) {
        pause()
      } else {
        play(trackId, previewUrl)
      }
    },
    [play, pause]
  )

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setState((s) => ({ ...s, currentTime: time }))
  }, [])

  /* ── Volume ──────────────────────────────────────────────────────── */

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1, Math.max(0, vol))
    const audio = audioRef.current
    if (audio) {
      audio.volume = clamped
      audio.muted = false
    }
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped))
    } catch {
      // localStorage unavailable
    }
    setState((s) => ({ ...s, volume: clamped, isMuted: false }))
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const newMuted = !audio.muted
    audio.muted = newMuted
    setState((s) => ({ ...s, isMuted: newMuted }))
  }, [])

  /* ── Shuffle & Repeat ────────────────────────────────────────────── */

  const toggleShuffle = useCallback(() => {
    setState((s) => ({ ...s, isShuffleOn: !s.isShuffleOn }))
  }, [])

  const toggleRepeat = useCallback(() => {
    setState((s) => ({ ...s, isRepeatOn: !s.isRepeatOn }))
  }, [])

  /* ── Queue navigation ────────────────────────────────────────────── */

  const playNext = useCallback(() => {
    const { queue, queueIndex, isShuffleOn } = stateRef.current
    if (queue.length === 0) return

    let nextIndex: number
    if (isShuffleOn) {
      if (queue.length <= 1) return
      // Pick a random index different from current
      do {
        nextIndex = Math.floor(Math.random() * queue.length)
      } while (nextIndex === queueIndex)
    } else {
      nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) return // End of queue
    }

    playTrackByIndex(nextIndex)
  }, [playTrackByIndex])

  const playPrev = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const { queue, queueIndex } = stateRef.current

    // If past threshold, restart current track
    if (audio.currentTime > RESTART_THRESHOLD_SECONDS) {
      audio.currentTime = 0
      setState((s) => ({ ...s, currentTime: 0 }))
      return
    }

    // Go to previous track in queue
    const prevIndex = queueIndex - 1
    if (prevIndex < 0) {
      // At start — restart current
      audio.currentTime = 0
      setState((s) => ({ ...s, currentTime: 0 }))
      return
    }

    if (queue[prevIndex]) {
      playTrackByIndex(prevIndex)
    }
  }, [playTrackByIndex])

  /* ── Queue management ────────────────────────────────────────────── */

  const replaceQueue = useCallback(
    (tracks: QueueTrack[], startIndex: number) => {
      setState((s) => ({ ...s, queue: tracks, queueIndex: startIndex }))
      const track = tracks[startIndex]
      if (track) {
        play(track.trackId, track.previewUrl)
      }
    },
    [play]
  )

  /* ── Context value ───────────────────────────────────────────────── */

  const value = useMemo(
    () => ({
      ...state,
      play,
      pause,
      toggle,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      toggleRepeat,
      playNext,
      playPrev,
      replaceQueue,
    }),
    [
      state,
      play,
      pause,
      toggle,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      toggleRepeat,
      playNext,
      playPrev,
      replaceQueue,
    ]
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
