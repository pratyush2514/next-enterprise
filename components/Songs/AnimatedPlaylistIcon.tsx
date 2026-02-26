"use client"

import { useEffect, useRef } from "react"

import { cn } from "lib/utils"

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
  }, [playing])

  return (
    <video
      ref={videoRef}
      src="/icons/playlist-animated.mp4"
      className={cn("pointer-events-none object-contain", className)}
      muted
      playsInline
      loop
      preload="auto"
      aria-hidden="true"
    />
  )
}
