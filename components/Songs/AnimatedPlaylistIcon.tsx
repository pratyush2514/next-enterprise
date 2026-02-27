"use client"

import { useEffect, useRef } from "react"

import { cn } from "lib/utils"

import { PlaylistIcon } from "./icons"

interface AnimatedPlaylistIconProps {
  className?: string
  playing?: boolean
}

export function AnimatedPlaylistIcon({ className, playing = false }: AnimatedPlaylistIconProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (playing) {
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }

    return () => {
      video.pause()
    }
  }, [playing])

  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Static SVG icon — visible when not animating */}
      <PlaylistIcon
        className={cn("size-full transition-opacity duration-150", playing ? "opacity-0" : "opacity-100")}
      />

      {/* Animated video — visible only during hover/active */}
      <video
        ref={videoRef}
        src="/icons/playlist-animated.mp4"
        className={cn(
          "pointer-events-none absolute inset-0 size-full object-contain transition-opacity duration-150",
          playing ? "opacity-100" : "opacity-0"
        )}
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
      />
    </span>
  )
}
