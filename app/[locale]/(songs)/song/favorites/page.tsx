"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { HeartIcon, PlayLargeIcon } from "components/Songs/icons"
import { useUpdatePlaybackTrack } from "components/Songs/SongsShell"
import { type QueueTrack, useAudioPreview } from "hooks/useAudioPreview"
import { useFavorites } from "hooks/useFavorites"
import { useSession } from "hooks/useSession"
import { Link } from "i18n/navigation"
import { cn } from "lib/utils"

export default function FavoritesPage() {
  const t = useTranslations("songs.favorites")
  const { isAuthenticated, isLoading: authLoading } = useSession()
  const { favorites, isLoading, toggleFavorite } = useFavorites()
  const { replaceQueue, activeTrackId, isPlaying } = useAudioPreview()
  const updatePlaybackTrack = useUpdatePlaybackTrack()
  const [loadingTrackIds, setLoadingTrackIds] = useState<Set<number>>(new Set())
  const [errorTrackId, setErrorTrackId] = useState<number | null>(null)

  const handlePlay = useCallback(
    async (trackId: number, index: number) => {
      setLoadingTrackIds((prev) => new Set(prev).add(trackId))
      setErrorTrackId(null)

      try {
        const res = await fetch(`/api/itunes/${trackId}`)
        if (!res.ok) {
          setErrorTrackId(trackId)
          return
        }

        const data = (await res.json()) as { previewUrl?: string }
        const previewUrl = data.previewUrl
        if (!previewUrl) {
          setErrorTrackId(trackId)
          return
        }

        const fav = favorites[index]
        if (!fav) return

        // Build queue from all favorites; set the fetched preview URL for the
        // clicked track and leave others empty (fetched on-demand by the player)
        const queue: QueueTrack[] = favorites.map((f) => ({
          trackId: f.trackId,
          previewUrl: f.trackId === trackId ? previewUrl : "",
          trackName: f.trackName,
          artistName: f.artistName,
          artworkUrl: f.artworkUrl100.replace("100x100", "300x300"),
        }))

        replaceQueue(queue, index)
        updatePlaybackTrack?.({
          trackName: fav.trackName,
          artistName: fav.artistName,
          artworkUrl: fav.artworkUrl100.replace("100x100", "300x300"),
        })
      } finally {
        setLoadingTrackIds((prev) => {
          const next = new Set(prev)
          next.delete(trackId)
          return next
        })
      }
    },
    [favorites, replaceQueue, updatePlaybackTrack]
  )

  if (authLoading || isLoading) {
    return (
      <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="animate-pulse overflow-hidden rounded-xl border border-gray-100 dark:border-white/5"
            >
              <div className="aspect-square bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2 p-3">
                <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
          <HeartIcon className="size-7 text-gray-300 dark:text-white/20" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t("signInRequired")}</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-white/50">{t("signInDescription")}</p>
        <Link
          href="/login"
          className="mt-6 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          {t("signIn")}
        </Link>
      </div>
    )
  }

  return (
    <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <HeartIcon filled className="size-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
          {favorites.length > 0 ? t("count", { count: favorites.length }) : t("empty")}
        </p>
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
            <HeartIcon className="size-7 text-gray-300 dark:text-white/20" />
          </div>
          <p className="text-base font-medium text-gray-600 dark:text-white/60">{t("emptyTitle")}</p>
          <p className="mt-1.5 text-sm text-gray-400 dark:text-white/30">{t("emptyHint")}</p>
          <Link
            href="/song"
            className="mt-6 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            {t("discoverMusic")}
          </Link>
        </div>
      )}

      {/* Favorites card grid */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {favorites.map((fav, index) => {
            const isThisActive = activeTrackId === fav.trackId
            const isThisLoading = loadingTrackIds.has(fav.trackId)
            const isThisError = errorTrackId === fav.trackId
            const artworkLarge = fav.artworkUrl100 ? fav.artworkUrl100.replace("100x100", "300x300") : ""

            return (
              <div
                key={fav.trackId}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200",
                  "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg",
                  "dark:border-white/[0.06] dark:bg-gray-900 dark:hover:border-white/10 dark:hover:shadow-black/30",
                  isThisActive && "ring-2 ring-emerald-500/50"
                )}
              >
                {/* Artwork */}
                <button
                  type="button"
                  onClick={() => handlePlay(fav.trackId, index)}
                  disabled={isThisLoading}
                  className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-white/5"
                  aria-label={t("play", { track: fav.trackName })}
                >
                  {artworkLarge && (
                    <Image
                      src={artworkLarge}
                      alt={`${fav.trackName} artwork`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                  )}

                  {/* Play overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30",
                      isThisActive && isPlaying && "bg-black/30"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all duration-200",
                        "scale-0 group-hover:scale-100",
                        isThisActive && "scale-100",
                        isThisLoading && "animate-pulse"
                      )}
                    >
                      <PlayLargeIcon className="size-5" />
                    </div>
                  </div>

                  {/* Now playing indicator */}
                  {isThisActive && isPlaying && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-0.5">
                      <span
                        className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-emerald-400"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="inline-block h-4 w-0.5 animate-pulse rounded-full bg-emerald-400"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="inline-block h-2.5 w-0.5 animate-pulse rounded-full bg-emerald-400"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  )}
                </button>

                {/* Info + remove */}
                <div className="flex items-start gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={fav.trackName}>
                      {fav.trackName}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-white/50" title={fav.artistName}>
                      {fav.artistName}
                    </p>
                    {/* Error feedback for failed playback */}
                    {isThisError && <p className="mt-1 text-[11px] text-red-500">{t("previewUnavailable")}</p>}
                  </div>

                  {/* Remove (unlike) button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(fav)}
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full p-1.5 transition-all",
                      "text-red-500 opacity-60 hover:bg-red-50 hover:opacity-100",
                      "dark:hover:bg-red-500/10",
                      "focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                    )}
                    aria-label={t("remove", { track: fav.trackName })}
                  >
                    <HeartIcon filled className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
