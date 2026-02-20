"use client"

import React from "react"

import type { FavoriteTrack } from "hooks/useFavorites"
import { useFavorites } from "hooks/useFavorites"
import { cn } from "lib/utils"

interface FavoriteButtonProps {
  track: FavoriteTrack
  className?: string
  size?: "sm" | "md"
}

export function FavoriteButton({ track, className, size = "sm" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(track.trackId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(track)
  }

  const iconSize = size === "sm" ? "size-4" : "size-5"
  const buttonSize = size === "sm" ? "size-8" : "size-10"

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        buttonSize,
        "flex items-center justify-center rounded-full transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
        favorited
          ? "bg-red-500/90 text-white hover:bg-red-600"
          : "bg-black/40 text-white/80 backdrop-blur-sm hover:bg-black/60 hover:text-white",
        className
      )}
      aria-label={favorited ? `Remove ${track.trackName} from favorites` : `Add ${track.trackName} to favorites`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={favorited ? 0 : 2}
        className={cn(iconSize, "transition-transform duration-200", favorited && "scale-110")}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
